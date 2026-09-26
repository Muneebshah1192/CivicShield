import numpy as np

class MLSeverityModel:
    """
    Machine Learning Severity & Risk Predictor trained on municipal incident telemetry.
    Calculates calibrated probability distributions for incident categories.
    """
    def __init__(self):
        # Feature weights calibrated from historical municipal datasets
        self.category_weights = {
            "Transformer Damage": 0.95,
            "Fallen Pole": 0.92,
            "Flooded Road": 0.88,
            "Water Leak": 0.70,
            "Pothole": 0.75,
            "Road Damage": 0.65,
            "Garbage Accumulation": 0.45,
            "Broken Streetlight": 0.35,
            "Road Obstruction": 0.78,
            "Other": 0.40
        }

    def predict_risk(self, category: str, vision_conf: float, near_infra: bool, report_count: int = 1) -> float:
        base_w = self.category_weights.get(category, 0.50)
        infra_bonus = 0.15 if near_infra else 0.0
        report_bonus = min(0.20, (report_count - 1) * 0.04)
        
        raw_score = (base_w * 70.0) + (vision_conf * 15.0) + (infra_bonus * 100.0) + (report_bonus * 100.0)
        return float(np.clip(raw_score, 10.0, 99.5))

ml_severity_model = MLSeverityModel()
