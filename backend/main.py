import os
import requests
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, Request, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from user_agents import parse

from database import employees, login_logs, alerts, audit_logs
from predict import predict_risk
from auth import hash_password, verify_password, create_access_token
from middleware import get_current_user, require_admin, require_employee
from otp_service import store_otp, verify_otp as _verify_otp
from email_service import (
    send_suspicious_login_alert_employee,
    send_high_risk_alert_admin
)
from utils import logger, log_audit

load_dotenv()

# --------------------------------------------------
# App
# --------------------------------------------------

app = FastAPI(
    title="AccountGuard AI",
    description="AI-Powered Identity Threat Detection Platform",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request / Response Models
# --------------------------------------------------

class LoginRequest(BaseModel):
    email: str
    password: str


class OTPVerifyRequest(BaseModel):
    employee_id: str
    otp: str


class EmployeeRegister(BaseModel):
    employee_id: str
    name: str
    email: str
    password: str
    department: str
    role: str = "Employee"   # "Admin" or "Employee"


class UnblockRequest(BaseModel):
    pass


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def _get_location(ip: str) -> str:
    try:
        resp = requests.get(f"http://ip-api.com/json/{ip}", timeout=5)
        data = resp.json()
        city    = data.get("city", "Unknown")
        country = data.get("country", "Unknown")
        return f"{city}, {country}"
    except Exception:
        return "Unknown"


def _safe_str(value) -> str:
    """Return stringified value for JSON-serialisable output."""
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value) if value is not None else ""


# --------------------------------------------------
# Home
# --------------------------------------------------

@app.get("/", tags=["Health"])
def home():
    return {"message": "AccountGuard AI Backend is Running", "version": "2.0.0"}


# --------------------------------------------------
# Register Employee  (Admin only — or open for seeding)
# --------------------------------------------------

@app.post("/register-employee", tags=["Admin"])
def register_employee(
    employee: EmployeeRegister,
    request: Request,
    current_user: dict = Depends(require_admin)
):
    if employees.find_one({"email": employee.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee with this email already exists"
        )
    if employees.find_one({"employee_id": employee.employee_id}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Employee ID already exists"
        )

    data = employee.model_dump()
    data["password"]       = hash_password(employee.password)
    data["status"]         = "Active"
    data["failed_attempts"] = 0

    employees.insert_one(data)

    log_audit(
        user=current_user.get("employee_id", "Admin"),
        action="Register Employee",
        description=f"Admin registered employee {employee.employee_id} - {employee.name}",
        ip=request.client.host
    )
    logger.info(f"Employee registered: {employee.employee_id}")

    return {"message": "Employee registered successfully"}


# --------------------------------------------------
# Bootstrap: first-time admin creation (no auth required)
# --------------------------------------------------

@app.post("/bootstrap-admin", tags=["Setup"], include_in_schema=False)
def bootstrap_admin(employee: EmployeeRegister):
    """
    Create the first admin without requiring a JWT.
    Remove / disable this endpoint after initial setup.
    """
    if employees.find_one({"role": "Admin"}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin already exists"
        )
    data = employee.model_dump()
    data["password"]        = hash_password(employee.password)
    data["status"]          = "Active"
    data["failed_attempts"] = 0
    data["role"]            = "Admin"
    employees.insert_one(data)
    return {"message": "Admin created successfully"}


# --------------------------------------------------
# Login
# --------------------------------------------------

@app.post("/login", tags=["Auth"])
def login(data: LoginRequest, request: Request):

    # --- Find employee ---
    employee = employees.find_one({"email": data.email})
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    # --- Blocked check ---
    if employee["status"] == "Blocked":
        log_audit(
            user=employee["employee_id"],
            action="Login Attempt",
            description="Login attempt on blocked account",
            ip=request.client.host
        )
        logger.warning(f"Blocked login attempt: {data.email}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account blocked. Contact your administrator."
        )

    # --- Password check ---
    if not verify_password(data.password, employee["password"]):
        new_fails = employee.get("failed_attempts", 0) + 1
        update = {"$set": {"failed_attempts": new_fails}}

        if new_fails >= 5:
            update["$set"]["status"] = "Blocked"
            employees.update_one({"email": data.email}, update)
            log_audit(
                user=employee["employee_id"],
                action="Account Blocked",
                description=f"Account blocked after {new_fails} failed attempts",
                ip=request.client.host
            )
            logger.warning(f"Account blocked: {data.email}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account blocked due to multiple failed attempts."
            )

        employees.update_one({"email": data.email}, update)
        logger.warning(f"Invalid password for: {data.email} ({new_fails} attempts)")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid password. Failed attempts: {new_fails}"
        )

    # --- Reset failed attempts ---
    employees.update_one(
        {"email": data.email},
        {"$set": {"failed_attempts": 0}}
    )

    # --- Collect login metadata ---
    ip_address = request.client.host
    user_agent_str = request.headers.get("user-agent", "")
    ua = parse(user_agent_str)

    browser          = ua.browser.family
    device           = ua.device.family
    operating_system = ua.os.family
    location         = _get_location(ip_address)
    login_time       = datetime.now(timezone.utc)

    # --- Compare with previous login ---
    prev = login_logs.find_one(
        {"employee_id": employee["employee_id"]},
        sort=[("login_time", -1)]
    )
    new_device   = "Yes" if (prev and prev.get("device") != device) else "No"
    new_location = "Yes" if (prev and prev.get("location") != location) else "No"

    # --- AI Risk Prediction ---
    risk = predict_risk(
        browser=browser,
        device=device,
        operating_system=operating_system,
        location=location,
        login_hour=login_time.hour,
        failed_attempts=employee.get("failed_attempts", 0),
        new_device=new_device,
        new_location=new_location
    )

    # --- Store login log ---
    login_logs.insert_one({
        "employee_id":      employee["employee_id"],
        "employee_name":    employee["name"],
        "email":            employee["email"],
        "ip_address":       ip_address,
        "browser":          browser,
        "device":           device,
        "operating_system": operating_system,
        "location":         location,
        "new_device":       new_device,
        "new_location":     new_location,
        "login_time":       login_time,
        "risk_prediction":  risk
    })

    log_audit(
        user=employee["employee_id"],
        action="Login",
        description=f"Employee logged in. Risk: {risk}",
        ip=ip_address
    )

    # --- High Risk: store alert, send emails, block ---
    if risk == "Suspicious":
        alerts.insert_one({
            "employee_id":      employee["employee_id"],
            "employee_name":    employee["name"],
            "email":            employee["email"],
            "risk":             "High",
            "ip_address":       ip_address,
            "browser":          browser,
            "device":           device,
            "operating_system": operating_system,
            "location":         location,
            "login_time":       login_time,
            "status":           "Unread"
        })
        log_audit(
            user=employee["employee_id"],
            action="Alert Created",
            description="High risk login alert generated",
            ip=ip_address
        )
        logger.warning(f"High-risk login detected: {data.email}")

        # Send email alerts (non-blocking)
        try:
            send_suspicious_login_alert_employee(
                receiver_email=employee["email"],
                employee_name=employee["name"],
                ip=ip_address,
                browser=browser,
                device=device,
                operating_system=operating_system,
                location=location,
                login_time=login_time.isoformat()
            )
            send_high_risk_alert_admin(
                employee_name=employee["name"],
                employee_email=employee["email"],
                ip=ip_address,
                browser=browser,
                device=device,
                operating_system=operating_system,
                location=location,
                login_time=login_time.isoformat()
            )
        except Exception as e:
            logger.error(f"Email alert failed: {e}")

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "message":          "Suspicious login detected. Access denied.",
                "risk":             "High",
                "employee_name":    employee["name"],
                "ip_address":       ip_address,
                "browser":          browser,
                "device":           device,
                "operating_system": operating_system,
                "location":         location,
                "new_device":       new_device,
                "new_location":     new_location
            }
        )

    # --- Medium Risk: trigger OTP ---
    if risk == "Medium":
        try:
            store_otp(employee["employee_id"], employee["email"])
        except Exception as e:
            logger.error(f"OTP send failed: {e}")
        log_audit(
            user=employee["employee_id"],
            action="OTP Generated",
            description="Medium risk — OTP sent for verification",
            ip=ip_address
        )
        logger.info(f"OTP triggered for: {data.email}")
        return {
            "message":       "Medium risk detected. OTP sent to your email.",
            "otp_required":  True,
            "employee_id":   employee["employee_id"],
            "risk":          "Medium"
        }

    # --- Normal Login: issue JWT ---
    token = create_access_token({
        "employee_id": employee["employee_id"],
        "email":       employee["email"],
        "name":        employee["name"],
        "role":        employee.get("role", "Employee"),
        "department":  employee.get("department", "")
    })

    log_audit(
        user=employee["employee_id"],
        action="Login Success",
        description="Normal login — JWT issued",
        ip=ip_address
    )
    logger.info(f"Successful login: {data.email}")

    return {
        "message":          "Login successful",
        "access_token":     token,
        "token_type":       "bearer",
        "employee_id":      employee["employee_id"],
        "employee_name":    employee["name"],
        "role":             employee.get("role", "Employee"),
        "risk":             "Low",
        "ip_address":       ip_address,
        "browser":          browser,
        "device":           device,
        "operating_system": operating_system,
        "location":         location,
        "new_device":       new_device,
        "new_location":     new_location
    }


# --------------------------------------------------
# OTP Verification
# --------------------------------------------------

@app.post("/verify-otp", tags=["Auth"])
def verify_otp_route(data: OTPVerifyRequest, request: Request):
    result = _verify_otp(data.employee_id, data.otp)

    if not result["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["reason"]
        )

    employee = employees.find_one({"employee_id": data.employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )

    token = create_access_token({
        "employee_id": employee["employee_id"],
        "email":       employee["email"],
        "name":        employee["name"],
        "role":        employee.get("role", "Employee"),
        "department":  employee.get("department", "")
    })

    log_audit(
        user=data.employee_id,
        action="OTP Verified",
        description="OTP verification successful — JWT issued",
        ip=request.client.host
    )
    logger.info(f"OTP verified: {data.employee_id}")

    return {
        "message":       "OTP verified. Login successful.",
        "access_token":  token,
        "token_type":    "bearer",
        "employee_id":   employee["employee_id"],
        "employee_name": employee["name"],
        "role":          employee.get("role", "Employee")
    }


# --------------------------------------------------
# Admin — Employee Management
# --------------------------------------------------

@app.get("/employees", tags=["Admin"])
def get_employees(current_user: dict = Depends(require_admin)):
    return [
        {k: _safe_str(v) if isinstance(v, datetime) else v
         for k, v in emp.items() if k != "_id" and k != "password"}
        for emp in employees.find({})
    ]


@app.put("/unblock/{employee_id}", tags=["Admin"])
def unblock_employee(
    employee_id: str,
    request: Request,
    current_user: dict = Depends(require_admin)
):
    result = employees.update_one(
        {"employee_id": employee_id},
        {"$set": {"status": "Active", "failed_attempts": 0}}
    )
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    log_audit(
        user=current_user.get("employee_id", "Admin"),
        action="Unblock Employee",
        description=f"Admin unblocked employee {employee_id}",
        ip=request.client.host
    )
    logger.info(f"Employee unblocked: {employee_id}")
    return {"message": "Employee unblocked successfully"}


# --------------------------------------------------
# Admin — Login History
# --------------------------------------------------

@app.get("/login-history", tags=["Admin"])
def get_login_history(current_user: dict = Depends(require_admin)):
    history = []
    for log in login_logs.find({}, {"_id": 0}):
        entry = {}
        for k, v in log.items():
            entry[k] = v.isoformat() if isinstance(v, datetime) else v
        history.append(entry)
    return history


# --------------------------------------------------
# Admin — Alerts
# --------------------------------------------------

@app.get("/alerts", tags=["Admin"])
def get_alerts(current_user: dict = Depends(require_admin)):
    result = []
    for alert in alerts.find({}, {"_id": 0}):
        entry = {}
        for k, v in alert.items():
            entry[k] = v.isoformat() if isinstance(v, datetime) else v
        result.append(entry)
    return result


@app.put("/alerts/{employee_id}/mark-read", tags=["Admin"])
def mark_alert_read(
    employee_id: str,
    current_user: dict = Depends(require_admin)
):
    alerts.update_many(
        {"employee_id": employee_id, "status": "Unread"},
        {"$set": {"status": "Read"}}
    )
    return {"message": "Alerts marked as read"}


# --------------------------------------------------
# Employee — Profile & Own Login History
# --------------------------------------------------

@app.get("/profile", tags=["Employee"])
def get_profile(current_user: dict = Depends(require_employee)):
    employee = employees.find_one(
        {"employee_id": current_user["employee_id"]},
        {"_id": 0, "password": 0}
    )
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found"
        )
    return employee


@app.get("/my-logins", tags=["Employee"])
def get_my_logins(current_user: dict = Depends(require_employee)):
    history = []
    for log in login_logs.find(
        {"employee_id": current_user["employee_id"]}, {"_id": 0}
    ):
        entry = {}
        for k, v in log.items():
            entry[k] = v.isoformat() if isinstance(v, datetime) else v
        history.append(entry)
    return history


# --------------------------------------------------
# Dashboard Analytics
# --------------------------------------------------

@app.get("/dashboard", tags=["Analytics"])
def get_dashboard(current_user: dict = Depends(require_admin)):
    total_employees  = employees.count_documents({})
    blocked          = employees.count_documents({"status": "Blocked"})
    today_start      = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    today_logins     = login_logs.count_documents({"login_time": {"$gte": today_start}})
    medium_risk      = login_logs.count_documents({"risk_prediction": "Medium"})
    high_risk        = login_logs.count_documents({"risk_prediction": "Suspicious"})
    total_alerts     = alerts.count_documents({})
    unread_alerts    = alerts.count_documents({"status": "Unread"})

    return {
        "total_employees":  total_employees,
        "blocked_employees": blocked,
        "todays_logins":    today_logins,
        "medium_risk":      medium_risk,
        "high_risk":        high_risk,
        "total_alerts":     total_alerts,
        "unread_alerts":    unread_alerts
    }


@app.get("/risk-distribution", tags=["Analytics"])
def get_risk_distribution(current_user: dict = Depends(require_admin)):
    pipeline = [
        {"$group": {"_id": "$risk_prediction", "count": {"$sum": 1}}}
    ]
    return [{"risk": r["_id"], "count": r["count"]}
            for r in login_logs.aggregate(pipeline)]


@app.get("/browser-stats", tags=["Analytics"])
def get_browser_stats(current_user: dict = Depends(require_admin)):
    pipeline = [
        {"$group": {"_id": "$browser", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    return [{"browser": r["_id"], "count": r["count"]}
            for r in login_logs.aggregate(pipeline)]


@app.get("/location-stats", tags=["Analytics"])
def get_location_stats(current_user: dict = Depends(require_admin)):
    pipeline = [
        {"$group": {"_id": "$location", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 15}
    ]
    return [{"location": r["_id"], "count": r["count"]}
            for r in login_logs.aggregate(pipeline)]


@app.get("/department-stats", tags=["Analytics"])
def get_department_stats(current_user: dict = Depends(require_admin)):
    pipeline = [
        {"$group": {"_id": "$department", "count": {"$sum": 1}}}
    ]
    return [{"department": r["_id"], "count": r["count"]}
            for r in employees.aggregate(pipeline)]


@app.get("/daily-logins", tags=["Analytics"])
def get_daily_logins(current_user: dict = Depends(require_admin)):
    pipeline = [
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$login_time"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 30}
    ]
    return [{"date": r["_id"], "count": r["count"]}
            for r in login_logs.aggregate(pipeline)]


# --------------------------------------------------
# Audit Logs
# --------------------------------------------------

@app.get("/audit-logs", tags=["Admin"])
def get_audit_logs(current_user: dict = Depends(require_admin)):
    result = []
    for log in audit_logs.find({}, {"_id": 0}):
        entry = {}
        for k, v in log.items():
            entry[k] = v.isoformat() if isinstance(v, datetime) else v
        result.append(entry)
    return result
