from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import joblib
import os

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")

# Load artifacts
with open(os.path.join(MODEL_DIR, "best_model.pkl"), "rb") as f:
    loaded_model = pickle.load(f)
with open(os.path.join(MODEL_DIR, "encoders.pkl"), "rb") as f:
    encoders = pickle.load(f)
with open(os.path.join(MODEL_DIR, "scaler.pkl"), "rb") as f:
    scaler = pickle.load(f)

NUMERICAL_COLS = ['tenure','MonthlyCharges','TotalCharges']
INPUT_COLUMNS   = [
    'gender','SeniorCitizen','Partner','Dependents','tenure','PhoneService',
    'MultipleLines','InternetService','OnlineSecurity','OnlineBackup',
    'DeviceProtection','TechSupport','StreamingTV','StreamingMovies',
    'Contract','PaperlessBilling','PaymentMethod','MonthlyCharges','TotalCharges'
]

@app.get("/api/health")
def health():
    return jsonify({"ok": True, "service": "flask-churn", "version": "1.0"})

@app.post("/api/predict")
def predict():
    """
    Expect JSON:
    {
      "features": { ... one row with keys in INPUT_COLUMNS ... }
      # or
      "features": [ {...}, {...} ]  # batch
    }
    """
    data = request.get_json(force=True) or {}
    feats = data.get("features")
    if feats is None:
        return jsonify({"error": "Missing 'features'"}), 400

    rows = feats if isinstance(feats, list) else [feats]

    # Build DataFrame with correct order
    try:
        df = pd.DataFrame(rows, columns=INPUT_COLUMNS)
    except Exception as e:
        return jsonify({"error": f"Bad input shape/keys: {e}"}), 400

    # Encode categoricals
    for col, encoder in encoders.items():
        if col in df.columns:
            try:
                df[col] = encoder.transform(df[col])
            except Exception:
                return jsonify({
                    "error": f"Invalid value for '{col}'. Allowed: {list(encoder.classes_)}"
                }), 400

    # Scale numerics
    try:
        df[NUMERICAL_COLS] = scaler.transform(df[NUMERICAL_COLS])
    except Exception as e:
        return jsonify({"error": f"Numeric transform failed: {e}"}), 400

    # Predict
    pred = loaded_model.predict(df).tolist()
    proba = loaded_model.predict_proba(df)[:,1].tolist() if hasattr(loaded_model, "predict_proba") else None
    labels = ["No Churn" if p == 0 else "Churn" for p in pred]

    return jsonify({"predictions": labels, "probabilities": proba})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
