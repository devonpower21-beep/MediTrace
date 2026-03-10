"""
Lab Setup Script for MediTrace
------------------------------
This script simulates the "Offline Data Science" phase.
It generates synthetic supply chain data, trains the Random Forest & Isolation Forest models,
and produces the visualization artifacts (confusion matrix, SHAP, etc.) used by the dashboard.

Run this ONCE before starting the Docker containers.
"""
import os
import pandas as pd
import numpy as np
import pickle
# import matplotlib.pyplot as plt
# import seaborn as sns
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix
import shutil

# --- Configuration ---
ARTIFACTS_DIR = "artifacts"
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

print("🔬 MedTrace Data Science Lab Initialized")
print("========================================")

# --- 1. Data Generation ---
print("[1/4] Generating Synthetic Data...")

# simulating 10k rows for training
np.random.seed(42)
n_samples = 10000

data = {
    'route_efficiency': np.random.normal(85, 10, n_samples),
    'time_diff_hours': np.random.normal(24, 4, n_samples),
    'temperature_avg': np.random.normal(4, 2, n_samples), # Cold chain
    'humidity_avg': np.random.normal(40, 5, n_samples),
    'vibration_shock': np.random.exponential(2, n_samples),
}

df = pd.DataFrame(data)
df['is_risk'] = 0

# logic: if temp is outside [2, 8] range or vibration > 2.0 or efficiency is low
anomaly_mask = (df['temperature_avg'] < 2.0) | (df['temperature_avg'] > 8.0) | (df['vibration_shock'] > 2.0) | (df['route_efficiency'] < 75)
df.loc[anomaly_mask, 'is_risk'] = 1

# Add some noise to make it realistic
noise_indices = np.random.choice(df.index, size=int(n_samples * 0.05), replace=False)
df.loc[noise_indices, 'is_risk'] = 1 - df.loc[noise_indices, 'is_risk']

print(f"      - Generated {n_samples} rows.")
print(f"      - Risk ratio: {df['is_risk'].mean():.2%}")

# Save CSV for reference
df.to_csv(os.path.join(ARTIFACTS_DIR, "training_data.csv"), index=False)


# --- 2. Model Training ---
print("[2/4] Training Models (Random Forest & Isolation Forest)...")

# A. Risk Classifier (Random Forest)
X = df.drop('is_risk', axis=1)
y = df['is_risk']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
clf.fit(X_train, y_train)

# B. Anomaly Detector (Isolation Forest)
iso_forest = IsolationForest(contamination=0.1, random_state=42)
iso_forest.fit(X) # Train on full dataset for anomaly baseline

print("      - Models trained successfully.")

# Save Models
with open(os.path.join(ARTIFACTS_DIR, "model.pkl"), "wb") as f:
    pickle.dump(clf, f)
    
with open(os.path.join(ARTIFACTS_DIR, "iso_forest.pkl"), "wb") as f:
    pickle.dump(iso_forest, f)

print("      - Models saved to .pkl")


# Generating Visualization Artifacts skipped for lightweight runtime


# --- 4. Completion ---
print("========================================")
print("✅ Lab Setup Complete. Artifacts ready for Docker.")
print(f"   Location: {os.path.abspath(ARTIFACTS_DIR)}")
