"""
ML Inference API
----------------
Lightweight Flask service that:
1. Loads the pre-trained `model.pkl` from the artifacts folder.
2. Exposes a /predict endpoint for real-time risk assessment.
3. Serves the static visualization images to the frontend.

Designed to run with minimal RAM (inference only, no training).
"""
# ... (imports)
import os
import pickle
import numpy as np
from flask import Flask, jsonify, request, send_from_directory
from pymongo import MongoClient
# Explicitly import IsolationForest to avoid pickle issues
from sklearn.ensemble import IsolationForest 

app = Flask(__name__)

# Config
MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/meditrace')
ARTIFACTS_DIR = os.path.join(os.getcwd(), 'artifacts')

# keep models loaded
model = None # RandomForest (Classifier)
iso_forest = None # IsolationForest (Anomaly Detection)

def load_models():
    global model, iso_forest
    # Load RandomForest
    model_path = os.path.join(ARTIFACTS_DIR, "model.pkl")
    if os.path.exists(model_path):
        try:
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            print(f"✅ Classifer loaded from {model_path}")
        except Exception as e:
            print(f"❌ Failed to load classifier: {e}")
    else:
        print(f"⚠️ Classifier not found at {model_path}")

    # Load Isolation Forest
    iso_path = os.path.join(ARTIFACTS_DIR, "isolation_forest.pkl")
    if os.path.exists(iso_path):
        try:
            with open(iso_path, "rb") as f:
                iso_forest = pickle.load(f)
            print(f"✅ Isolation Forest loaded from {iso_path}")
        except Exception as e:
            print(f"❌ Failed to load Isolation Forest: {e}")
    else:
        print(f"⚠️ Isolation Forest not found at {iso_path}")

# Initialize
load_models()

# MongoDB connection
try:
    client = MongoClient(MONGO_URI)
    db = client.get_database()
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")

@app.route('/')
def health_check():
    status = "healthy" if model and iso_forest else "degraded"
    return jsonify({
        "status": status, 
        "service": "ml-inference",
        "models": {
            "classifier": "loaded" if model else "missing",
            "anomaly_detector": "loaded" if iso_forest else "missing"
        }
    })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    # Expected features map
    
    # fallback
    if not model and not iso_forest:
        return jsonify({
            "risk_score": 0.05, 
            "status": "OK (Mock)", 
            "anomaly_score": 0.0,
            "is_anomaly": False,
            "note": "Models not loaded."
        })

    try:
        # Features: [route_efficiency, time_diff_hours, temperature_avg, humidity_avg, vibration_shock]
        features = [
            data.get('route_efficiency', 85),
            data.get('time_diff_hours', 24),
            data.get('temperature_avg', 4),
            data.get('humidity_avg', 40),
            data.get('vibration_shock', 2)
        ]
        
        response = {}

        # 1. Classification (Risk Risk)
        if model:
            prediction = model.predict([features])[0]
            probs = model.predict_proba([features])[0] 
            risk_score = probs[1]
            response["risk_score"] = float(risk_score)
            response["status"] = "Risk" if prediction == 1 else "OK"
        else:
            response["risk_score"] = 0.0
            response["status"] = "Unknown"

        # 2. Anomaly Detection (Outlier)
        if iso_forest:
            # decision_function returns negative for outliers, positive for inliers
            # We invert it for "anomaly score" where higher is more anomalous?
            # Standard: predict() returns -1 for outlier, 1 for inlier
            # decision_function() returns score. Lower = more anomalous.
            
            # Let's normalize score roughly to 0-1 for UI? 
            # Actually, standard score is fine, but let's provide the raw decision
            raw_score = iso_forest.decision_function([features])[0]
            is_anomaly = iso_forest.predict([features])[0] == -1
            
            # decision_function: < 0 is anomaly. 
            # Let's emit an "anomaly_index" = -raw_score (so high is bad)
            # Typically range is -0.5 to 0.5 roughly.
            
            response["anomaly_score"] = float(raw_score) 
            response["is_anomaly"] = bool(is_anomaly)
        else:
             response["anomaly_score"] = 0.0
             response["is_anomaly"] = False

        return jsonify(response)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/metrics/<filename>')
def serve_metrics(filename):
    return send_from_directory(ARTIFACTS_DIR, filename)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
