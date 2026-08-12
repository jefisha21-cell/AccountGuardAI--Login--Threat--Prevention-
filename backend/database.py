from pymongo import MongoClient
import os
import ssl
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(
    os.getenv("MONGO_URI"),
    tls=True,
    tlsAllowInvalidCertificates=True
)

db = client["accountguard"]

# Collections
employees  = db["employees"]
login_logs = db["login_logs"]
alerts     = db["alerts"]
otp_codes  = db["otp_codes"]
audit_logs = db["audit_logs"]
