import os
import pickle
import numpy as np
from sklearn.ensemble import IsolationForest

# Config
ARTIFACTS_DIR = os.path.join(os.getcwd(), 'artifacts')
if not os.path.exists(ARTIFACTS_DIR):
    os.makedirs(ARTIFACTS_DIR)

def train_isolation_forest():
    print("🚀 Training Isolation Forest for Anomaly Detection...")

    # 1. Generate Synthetic Training Data (Mostly Normal)
    # Features: [route_efficiency, time_diff_hours, temperature_avg, humidity_avg, vibration_shock]
    n_samples = 1000
    rng = np.random.RandomState(42)

    # Normal user data (Cluster 1)
    X_normal = 0.3 * rng.randn(n_samples, 5)
    X_normal[:, 0] += 90   # route_efficiency ~ 90
    X_normal[:, 1] += 24   # time_diff_hours ~ 24
    X_normal[:, 2] += 4    # temperature_avg ~ 4
    X_normal[:, 3] += 40   # humidity_avg ~ 40
    X_normal[:, 4] += 1    # vibration_shock ~ 1

    # Add some outliers (Anomalies)
    X_outliers = rng.uniform(low=0, high=100, size=(50, 5))
    X_train = np.r_[X_normal, X_outliers]

    # 2. Train Isolation Forest
    clf = IsolationForest(n_estimators=100, max_samples='auto', contamination=0.1, random_state=42)
    clf.fit(X_train)

    # 3. Save Model
    model_path = os.path.join(ARTIFACTS_DIR, "isolation_forest.pkl")
    with open(model_path, "wb") as f:
        pickle.dump(clf, f)
    
    print(f"✅ Isolation Forest model saved to: {model_path}")

    # 4. Verify
    print("\n--- Test Prediction ---")
    test_normal = [[90, 24, 4, 40, 1]]  # Expected 1 (Normal)
    test_anomaly = [[50, 100, 30, 90, 10]] # Expected -1 (Anomaly)
    
    print(f"Normal Sample Score: {clf.decision_function(test_normal)[0]:.4f} (Prediction: {clf.predict(test_normal)[0]})")
    print(f"Anomaly Sample Score: {clf.decision_function(test_anomaly)[0]:.4f} (Prediction: {clf.predict(test_anomaly)[0]})")

if __name__ == "__main__":
    train_isolation_forest()
