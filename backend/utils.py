import logging
import os
from datetime import datetime
from database import audit_logs

# --------------------------------------------------
# Logger Setup
# --------------------------------------------------

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "accountguard.log")),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("accountguard")


# --------------------------------------------------
# Audit Log Helper
# --------------------------------------------------

def log_audit(
    user: str,
    action: str,
    description: str,
    ip: str = "N/A"
):
    """Insert an audit log entry into MongoDB."""
    try:
        audit_logs.insert_one({
            "user": user,
            "action": action,
            "description": description,
            "ip": ip,
            "timestamp": datetime.utcnow()
        })
    except Exception as exc:
        logger.error(f"Audit log failed: {exc}")
