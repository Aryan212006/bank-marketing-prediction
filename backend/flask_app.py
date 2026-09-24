import os
import sys
import warnings

warnings.filterwarnings("ignore")

import json
import joblib
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Directories
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(CURRENT_DIR)
ARTIFACTS_DIR = os.path.join(BASE_DIR, "saved_models")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

@app.after_request
def add_header(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response

# Global ML artifacts
model = None
scaler = None
encoders = None
feature_order = None
numerical_features = None
categorical_features = None
feature_importance = None

def load_ml_artifacts():
    """Load serialized models, scalers, encoders, and analytics metadata."""
    global model, scaler, encoders, feature_order, numerical_features, categorical_features, feature_importance
    try:
        model = joblib.load(os.path.join(ARTIFACTS_DIR, "bank_model.pkl"))
        scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "scaler.pkl"))
        encoders = joblib.load(os.path.join(ARTIFACTS_DIR, "encoders.pkl"))
        feature_order = joblib.load(os.path.join(ARTIFACTS_DIR, "feature_order.pkl"))
        numerical_features = joblib.load(os.path.join(ARTIFACTS_DIR, "numerical_features.pkl"))
        categorical_features = joblib.load(os.path.join(ARTIFACTS_DIR, "categorical_features.pkl"))
        
        # Load feature importance if present
        imp_path = os.path.join(ARTIFACTS_DIR, "feature_importance.json")
        if os.path.exists(imp_path):
            with open(imp_path, "r") as f:
                feature_importance = json.load(f)
        else:
            feature_importance = []
            
        print(f"[OK] Flask API successfully loaded ML artifacts from: {ARTIFACTS_DIR}")
    except Exception as e:
        print(f"[ERROR] Failed to load model artifacts: {e}")
        raise RuntimeError(f"Could not load artifacts from {ARTIFACTS_DIR}. Ensure you run Week 5 training first.")

# Load models upon startup
load_ml_artifacts()

def preprocess_customer_input(data: dict) -> pd.DataFrame:
    """Preprocess single customer record with exact training transformations (Zero Leakage)."""
    df = pd.DataFrame([data])
    
    # 1. Encode categorical features
    for col in categorical_features:
        le = encoders[col]
        val = str(df[col].iloc[0])
        if val in le.classes_:
            df[col] = le.transform([val])[0]
        else:
            df[col] = 0  # Fallback for unseen values
            
    # 2. Scale numerical features
    df[numerical_features] = scaler.transform(df[numerical_features])
    
    # 3. Ensure exact training column order
    return df[feature_order]

@app.route("/", methods=["GET"])
def index():
    # If explicitly requested JSON or /api
    accept_header = request.headers.get("Accept", "")
    if request.args.get("json") == "1" or ("application/json" in accept_header and "text/html" not in accept_header):
        return jsonify({
            "project": "BankWise AI — Intelligent Bank Marketing Prediction & Customer Analytics",
            "institution": "Darshan University, Computer Engineering Department",
            "framework": "Flask 3.x REST API",
            "status": "online",
            "endpoints": {
                "health": "/health (GET)",
                "features": "/api/features (GET)",
                "analytics": "/api/analytics (GET)",
                "predict": "/predict (POST)"
            }
        })
    if os.path.exists(os.path.join(FRONTEND_DIR, "index.html")):
        return send_from_directory(FRONTEND_DIR, "index.html")
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/dashboard", methods=["GET"])
@app.route("/ui", methods=["GET"])
def dashboard():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/health", methods=["GET"])
def health_check():
    is_loaded = (model is not None and scaler is not None and encoders is not None)
    if is_loaded:
        return jsonify({
            "status": "healthy",
            "model_loaded": True,
            "algorithm": "RandomForestClassifier (Tuned Balanced Ensemble)",
            "framework": "Flask"
        }), 200
    else:
        return jsonify({
            "status": "unhealthy",
            "model_loaded": False,
            "error": "Model artifacts not loaded"
        }), 503

@app.route("/api/features", methods=["GET"])
def get_features():
    return jsonify({
        "numerical_features": numerical_features,
        "categorical_features": categorical_features,
        "feature_order": feature_order
    })

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    """Returns model hyperparameters, evaluation metrics, and feature importance for the UI dashboard."""
    return jsonify({
        "model_info": {
            "algorithm": "RandomForestClassifier",
            "library": "Scikit-Learn (Optimized with GridSearchCV)",
            "strategy": "Class-Balanced Ensemble (Addressing ~11.7% class imbalance)",
            "feature_count": len(feature_order) if feature_order else 16,
            "hyperparameters": {
                "n_estimators": 150,
                "max_depth": 14,
                "min_samples_split": 20,
                "class_weight": "balanced",
                "random_state": 42
            },
            "performance": {
                "accuracy": 85.22,
                "precision": 43.22,
                "recall": 84.12,
                "f1_score": 57.11,
                "roc_auc": 92.45
            },
            "cross_validation_5fold": {
                "mean_roc_auc": 0.9211,
                "std_roc_auc": 0.0021,
                "mean_f1": 0.5740
            }
        },
        "dataset_info": {
            "name": "UCI Bank Marketing Dataset",
            "total_records": 45211,
            "features": 16,
            "target": "y (Term Deposit Subscription)",
            "class_distribution": {
                "no": 39922,
                "yes": 5289,
                "subscription_percentage": 11.7
            }
        },
        "feature_importance": feature_importance[:10] if feature_importance else []
    })

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({"error": "Missing JSON request body"}), 400
        
        # Verify required features
        required_fields = set(numerical_features + categorical_features)
        missing = [f for f in required_fields if f not in data]
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 422
            
        # Preprocess input
        input_df = preprocess_customer_input(data)
        
        # Generate probability estimates
        probabilities = model.predict_proba(input_df)[0]
        prob_subscribe = float(probabilities[1])
        
        # Decision threshold = 0.5
        prediction = 1 if prob_subscribe >= 0.5 else 0
        label = "Yes" if prediction == 1 else "No"
        confidence = prob_subscribe if prediction == 1 else (1.0 - prob_subscribe)
        
        # Strategic actionable recommendation
        if prediction == 1:
            if prob_subscribe >= 0.75:
                rec = "High-priority prospect. Contact immediately via senior relationship manager for premium term deposit products."
            else:
                rec = "Moderate-priority prospect. Include in personalized digital marketing and follow up via direct telephone call."
        else:
            if prob_subscribe <= 0.20:
                rec = "Low-probability lead. Avoid expensive telemarketing calls to minimize operational expenses."
            else:
                rec = "Borderline candidate. Send informative digital email campaigns before scheduling outbound telemarketing."
                
        return jsonify({
            "prediction": prediction,
            "prediction_label": label,
            "subscription_probability": round(prob_subscribe, 4),
            "confidence_score": round(confidence * 100.0, 2),
            "recommendation": rec
        })
    except Exception as e:
        return jsonify({"error": f"Inference error: {str(e)}"}), 500

if __name__ == "__main__":
    # Run Flask on port 5000
    print("[INFO] Starting BankWise AI Flask REST API server on http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
