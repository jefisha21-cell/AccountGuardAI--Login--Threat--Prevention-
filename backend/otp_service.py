import random
import string
from datetime import datetime, timedelta
from database import otp_codes
from email_service import send_otp


def generate_otp() -> str:
    """Generate a 6-digit numeric OTP."""
    return "".join(random.choices(string.digits, k=6))


def store_otp(employee_id: str, email: str) -> str:
    """Generate, store, and email an OTP. Returns the OTP."""
    otp = generate_otp()
    expiry = datetime.utcnow() + timedelta(minutes=5)

    # Remove any previous OTP for this employee
    otp_codes.delete_many({"employee_id": employee_id})

    otp_codes.insert_one({
        "employee_id": employee_id,
        "email": email,
        "otp": otp,
        "expiry": expiry,
        "verified": False,
        "created_at": datetime.utcnow()
    })

    send_otp(email, otp)
    return otp


def verify_otp(employee_id: str, otp: str) -> dict:
    """
    Verify OTP for an employee.
    Returns {"valid": True/False, "reason": str}
    """
    record = otp_codes.find_one(
        {"employee_id": employee_id},
        sort=[("created_at", -1)]
    )

    if not record:
        return {"valid": False, "reason": "No OTP found"}

    if record["verified"]:
        return {"valid": False, "reason": "OTP already used"}

    if datetime.utcnow() > record["expiry"]:
        return {"valid": False, "reason": "OTP expired"}

    if record["otp"] != otp:
        return {"valid": False, "reason": "Invalid OTP"}

    # Mark as verified
    otp_codes.update_one(
        {"_id": record["_id"]},
        {"$set": {"verified": True}}
    )

    return {"valid": True, "reason": "OTP verified successfully"}
