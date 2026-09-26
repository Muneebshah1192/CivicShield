import time
from typing import Dict, Any

class IntakeAgent:
    name = "Intake Agent"

    async def run(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        start_time = time.time()
        
        description = raw_data.get("description", "").strip()
        latitude = float(raw_data.get("latitude", 0.0))
        longitude = float(raw_data.get("longitude", 0.0))
        user_category = raw_data.get("category")
        image_url = raw_data.get("image_url")
        
        # Validation & Normalization
        is_valid = len(description) >= 3 and latitude != 0.0 and longitude != 0.0
        
        output = {
            "status": "VALIDATED" if is_valid else "INVALID",
            "normalized_description": description,
            "latitude": latitude,
            "longitude": longitude,
            "user_category": user_category,
            "has_image": bool(image_url),
            "image_url": image_url,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        
        latency = int((time.time() - start_time) * 1000)
        return {
            "agent_name": self.name,
            "confidence": 1.0 if is_valid else 0.4,
            "latency_ms": max(latency, 12),
            "output": output
        }
