import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

EMAIL_ADDRESS  = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL")


def _send(to: str, subject: str, body: str):
    """Internal helper — sends a plain-text email via Gmail SMTP SSL."""
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"]    = EMAIL_ADDRESS
    msg["To"]      = to
    msg.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        smtp.send_message(msg)


# --------------------------------------------------
# OTP Email
# --------------------------------------------------

def send_otp(receiver_email: str, otp: str):
    """Send OTP verification email to employee."""
    _send(
        to=receiver_email,
        subject="AccountGuard AI - Login Verification OTP",
        body=f"""Hello,

Your One-Time Password (OTP) is:

  {otp}

This OTP is valid for 5 minutes.

If you did not attempt to log in, please contact your administrator immediately.

Regards,
AccountGuard AI Security Team
"""
    )


# --------------------------------------------------
# Suspicious Login Alert — Employee
# --------------------------------------------------

def send_suspicious_login_alert_employee(
    receiver_email: str,
    employee_name: str,
    ip: str,
    browser: str,
    device: str,
    operating_system: str,
    location: str,
    login_time: str
):
    """Notify the employee that a suspicious login was detected on their account."""
    _send(
        to=receiver_email,
        subject="⚠️ AccountGuard AI - Suspicious Login Detected on Your Account",
        body=f"""Hello {employee_name},

A suspicious login attempt was detected on your AccountGuard account.

Login Details:
  IP Address    : {ip}
  Browser       : {browser}
  Device        : {device}
  OS            : {operating_system}
  Location      : {location}
  Time          : {login_time}

If this was not you, contact your administrator immediately.

Regards,
AccountGuard AI Security Team
"""
    )


# --------------------------------------------------
# High-Risk Alert — Admin
# --------------------------------------------------

def send_high_risk_alert_admin(
    employee_name: str,
    employee_email: str,
    ip: str,
    browser: str,
    device: str,
    operating_system: str,
    location: str,
    login_time: str
):
    """Notify the admin of a high-risk login event."""
    if not ADMIN_EMAIL:
        return
    _send(
        to=ADMIN_EMAIL,
        subject="🚨 AccountGuard AI - High Risk Login Alert",
        body=f"""Hello Admin,

A HIGH RISK login has been detected.

Employee   : {employee_name} ({employee_email})
IP Address : {ip}
Browser    : {browser}
Device     : {device}
OS         : {operating_system}
Location   : {location}
Time       : {login_time}

Please review this alert in your admin dashboard immediately.

Regards,
AccountGuard AI Security System
"""
    )
