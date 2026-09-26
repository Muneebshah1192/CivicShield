from datetime import datetime, timedelta
from typing import Dict, Any

SLA_DEFAULT_MINUTES = {
    "CRITICAL": 15,
    "HIGH": 60,
    "MEDIUM": 360,
    "LOW": 1440
}

def calculate_sla_status(created_at: datetime, severity_level: str, status: str) -> Dict[str, Any]:
    max_minutes = SLA_DEFAULT_MINUTES.get(severity_level, 360)
    deadline = created_at + timedelta(minutes=max_minutes)
    now = datetime.utcnow()
    
    elapsed_minutes = int((now - created_at).total_seconds() / 60)
    remaining_minutes = int((deadline - now).total_seconds() / 60)
    
    is_breached = remaining_minutes < 0 and status not in ["RESOLVED", "REJECTED"]
    
    return {
        "severity_level": severity_level,
        "sla_target_minutes": max_minutes,
        "elapsed_minutes": max(0, elapsed_minutes),
        "remaining_minutes": remaining_minutes,
        "is_breached": is_breached,
        "deadline_iso": deadline.isoformat()
    }
