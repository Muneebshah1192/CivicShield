import time
from typing import Dict, Any

class DepartmentRoutingAgent:
    name = "Department Routing Agent"

    DEPARTMENT_MAP = {
        "Fallen Pole": ("Electricity", "MW-ELEC-01"),
        "Transformer Damage": ("Electricity", "MW-ELEC-01"),
        "Broken Streetlight": ("Electricity", "MW-ELEC-01"),
        "Flooded Road": ("Water & Sewerage", "MW-WTR-02"),
        "Water Leak": ("Water & Sewerage", "MW-WTR-02"),
        "Pothole": ("Municipal Works", "MW-WORKS-03"),
        "Road Damage": ("Municipal Works", "MW-WORKS-03"),
        "Road Obstruction": ("Municipal Works", "MW-WORKS-03"),
        "Garbage Accumulation": ("Waste Management", "MW-WASTE-04"),
        "Traffic Signal": ("Traffic Control", "MW-TRAF-05"),
        "Other": ("Municipal Works", "MW-WORKS-03")
    }

    async def run(self, category: str, risk_data: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()

        dept_info = self.DEPARTMENT_MAP.get(category, ("Municipal Works", "MW-WORKS-03"))
        department_name, department_code = dept_info
        
        confidence = 0.95 if category in self.DEPARTMENT_MAP else 0.72

        output = {
            "recommended_department": department_name,
            "department_code": department_code,
            "routing_confidence": confidence,
            "requires_human_override_flag": confidence < 0.75,
            "routing_reason": f"Category '{category}' directly maps to municipal domain '{department_name}'."
        }

        latency = int((time.time() - start_time) * 1000)
        return {
            "agent_name": self.name,
            "confidence": confidence,
            "latency_ms": max(latency, 18),
            "output": output
        }
