import time
import re
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Incident, Worker, Department, AIAgentRun

class CitizenTrackingBotAgent:
    name = "CivicShield AI Assistant & Tracking Bot"

    async def handle_query(self, db: Session, query: str) -> Dict[str, Any]:
        start_time = time.time()
        q_lower = query.lower().strip()

        # Extract incident ID pattern if mentioned (e.g. INC-1042, INC1042, 1042)
        match = re.search(r'(INC-?\d{4})', query, re.IGNORECASE)
        found_inc_id = None
        if match:
            raw_id = match.group(1).upper()
            found_inc_id = raw_id if "-" in raw_id else f"INC-{raw_id.replace('INC', '')}"

        response_text = ""
        incident_card = None

        if found_inc_id:
            incident = db.query(Incident).filter(Incident.id == found_inc_id).first()
            if incident:
                worker_name = incident.assigned_worker.user.full_name if incident.assigned_worker and incident.assigned_worker.user else "Unassigned (Queued in Triage)"
                dept_name = incident.department.name if incident.department else "Municipal Works"
                
                response_text = (
                    f"📍 **Status for {incident.id} ({incident.category})**:\n\n"
                    f"• **Current Lifecycle State:** `{incident.status}`\n"
                    f"• **Assigned Department:** {dept_name}\n"
                    f"• **Field Lead:** {worker_name}\n"
                    f"• **Assessed Severity:** {incident.severity_level} (Risk Score: {incident.risk_score}/100)\n"
                    f"• **Location:** {incident.address or 'Sector Zone A'}\n\n"
                    f"{'✅ This issue has been verified and resolved by the municipal field crew!' if incident.status in ['RESOLVED', 'AI_VERIFIED'] else '⚡ The response team is actively mobilizing according to municipal SLA protocols.'}"
                )
                incident_card = {
                    "id": incident.id,
                    "title": incident.title,
                    "category": incident.category,
                    "status": incident.status,
                    "severity": incident.severity_level,
                    "risk_score": incident.risk_score,
                    "department": dept_name,
                    "worker": worker_name
                }
            else:
                response_text = f"I could not locate incident record `{found_inc_id}` in our municipal database. Please double-check your tracking ID."
        
        elif "how to report" in q_lower or "submit" in q_lower or "guide" in q_lower:
            response_text = (
                "👋 **How to submit an infrastructure complaint**:\n\n"
                "1. Go to the **Report Issue** tab.\n"
                "2. Upload or snap a photo of the hazard.\n"
                "3. Allow GPS location permission or choose on map.\n"
                "4. Add a short description (e.g. *'Pothole near university gate'*).\n"
                "5. Click **Submit** — CivicShield AI will automatically classify, check authenticity, and dispatch the responsible team!"
            )
        elif "hello" in q_lower or "hi" in q_lower or "help" in q_lower:
            response_text = (
                "Hello! I am **CivicShield Assistant** 🤖. I can help you:\n\n"
                "• **Track any complaint**: Type *'Where is INC-1044?'*\n"
                "• **Guide you** on how to report a pothole, flood, or fallen wire\n"
                "• **Check department response times** and active municipal operations."
            )
        else:
            # General fallback intelligent response
            active_count = db.query(Incident).filter(Incident.status.notin_(["RESOLVED", "REJECTED"])).count()
            response_text = (
                f"I'm here to help with all municipal emergency tracking. Currently, **{active_count} active incidents** "
                f"are being managed across the city. You can provide your ticket ID (e.g., *INC-1042*) to see live progress!"
            )

        latency = int((time.time() - start_time) * 1000)
        return {
            "agent_name": self.name,
            "response": response_text,
            "incident_card": incident_card,
            "latency_ms": max(latency, 15)
        }

tracking_bot_agent = CitizenTrackingBotAgent()
