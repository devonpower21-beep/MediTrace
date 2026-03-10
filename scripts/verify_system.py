import requests
import json
import sys
import time
from pymongo import MongoClient

# Configuration
ML_URL = "http://localhost:5000"
WEB_URL = "http://localhost:3000"
BLOCKCHAIN_RPC = "http://127.0.0.1:8545"
MONGO_URI = "mongodb://localhost:27017/meditrace"

def print_status(component, status, message=""):
    color = "\033[92m" if status == "PASS" else "\033[91m"
    reset = "\033[0m"
    print(f"[{component}] {color}{status}{reset} {message}")

def check_ml_service():
    print("\n--- Checking ML Service ---")
    try:
        # 1. Health Check
        r = requests.get(f"{ML_URL}/")
        if r.status_code == 200:
            data = r.json()
            print_status("ML Health", "PASS", f"Status: {data.get('status')} Models: {data.get('models')}")
        else:
            print_status("ML Health", "FAIL", f"Status Code: {r.status_code}")
            return False

        # 2. Prediction (Normal)
        payload_normal = {
            "route_efficiency": 95,
            "time_diff_hours": 24,
            "temperature_avg": 4.0,
            "humidity_avg": 40,
            "vibration_shock": 1
        }
        r = requests.post(f"{ML_URL}/predict", json=payload_normal)
        if r.status_code == 200:
            res = r.json()
            is_anomaly = res.get("is_anomaly")
            status = res.get("status")
            if not is_anomaly and status == "OK":
                print_status("ML Predict (Normal)", "PASS", f"Score: {res.get('risk_score'):.2f}, Anomaly: {res.get('anomaly_score'):.2f}")
            else:
                print_status("ML Predict (Normal)", "WARN", f"Unexpected result: {res}")
        else:
             print_status("ML Predict", "FAIL", f"Status: {r.status_code}")

        # 3. Prediction (Anomaly)
        payload_anomaly = {
            "route_efficiency": 20,
            "time_diff_hours": 200,
            "temperature_avg": 30.0,
            "humidity_avg": 95,
            "vibration_shock": 50
        }
        r = requests.post(f"{ML_URL}/predict", json=payload_anomaly)
        if r.status_code == 200:
            res = r.json()
            is_anomaly = res.get("is_anomaly")
            if is_anomaly:
                print_status("ML Predict (Anomaly)", "PASS", f"Detected Anomaly! Score: {res.get('anomaly_score'):.2f}")
            else:
                print_status("ML Predict (Anomaly)", "WARN", f"Failed to detect anomaly. Result: {res}")

    except Exception as e:
        print_status("ML Service", "FAIL", f"Connection failed: {e}")

def check_blockchain():
    print("\n--- Checking Blockchain ---")
    try:
        payload = {"jsonrpc":"2.0","method":"net_version","params":[],"id":67}
        r = requests.post(BLOCKCHAIN_RPC, json=payload)
        if r.status_code == 200:
            print_status("Ganache RPC", "PASS", f"Network ID: {r.json().get('result')}")
        else:
            print_status("Ganache RPC", "FAIL", f"Status: {r.status_code}")
    except Exception as e:
         print_status("Blockchain", "FAIL", f"Connection failed: {e}")

def check_mongodb():
    print("\n--- Checking MongoDB ---")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        print_status("MongoDB", "PASS", "Connection Successful")
        
        db = client.get_database()
        cols = db.list_collection_names()
        print_status("Collections", "INFO", f"Found: {cols}")
        
    except Exception as e:
        print_status("MongoDB", "FAIL", f"Connection failed: {e}")

def check_web_app():
    print("\n--- Checking Web App Routes ---")
    routes = ["/login", "/register", "/verify", "/api/batch/TEST_ID"]
    for route in routes:
        try:
            r = requests.get(f"{WEB_URL}{route}")
            # Public routes: 200
            # Protected routes (no auth): 401
            # Missing resource (public): 404
            
            if route.startswith("/api/batch") and r.status_code == 401:
                print_status(f"Route {route}", "PASS", f"Status: {r.status_code} (Secured)")
            elif r.status_code in [200, 404]: 
                print_status(f"Route {route}", "PASS", f"Status: {r.status_code}")
            else:
                print_status(f"Route {route}", "WARN", f"Status: {r.status_code}")
        except Exception as e:
            print_status(f"Route {route}", "FAIL", f"Connection failed: {e}")

if __name__ == "__main__":
    print("🚀 Starting System Integration Verification...")
    check_mongodb()
    check_blockchain()
    check_ml_service()
    check_web_app()
    print("\n✅ Verification Complete")
