# Custom Model Training & Drop-In Guide for CivicShield AI

CivicShield AI supports drop-in custom trained YOLO computer vision and ML models.

### 1. Dropping in your trained YOLO Model:
After training your YOLOv8, YOLOv10, or YOLOv11 model in Google Colab (e.g. on pothole, flood, pole datasets):
1. Export your weights as `yolo_weights.pt` or `yolo_weights.onnx`.
2. Place the file inside this directory:
   `backend/app/ml/models/yolo_weights.pt`
3. The `YOLO Vision Agent` (`vision_agent.py`) will automatically detect the custom weights on startup and execute inference with your trained model!

### 2. Supported Target Damage Classes:
- `Pothole`
- `Flooded Road`
- `Fallen Pole`
- `Transformer Damage`
- `Broken Streetlight`
- `Water Leak`
- `Garbage Accumulation`
- `Road Obstruction`
- `Road Damage`
