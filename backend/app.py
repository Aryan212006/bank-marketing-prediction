import os
import sys
from contextlib import asynccontextmanager
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

# Ensure the backend directory is in the Python module search path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from schemas import CustomerData, PredictionResponse

# Paths and global ML artifacts
BASE_DIR = os.path.dirname(CURRENT_DIR)
ARTIFACTS_DIR = os.path.join(BASE_DIR, "saved_models")

model = None
scaler = None
encoders = None
feature_order = None
numerical_features = None
categorical_features = None

def load_ml_artifacts():
    """Load trained models and preprocessing serializers."""
    global model, scaler, encoders, feature_order, numerical_features, categorical_features
    try:
        model = joblib.load(os.path.join(ARTIFACTS_DIR, "bank_model.pkl"))
        scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "scaler.pkl"))
        encoders = joblib.load(os.path.join(ARTIFACTS_DIR, "encoders.pkl"))
        feature_order = joblib.load(os.path.join(ARTIFACTS_DIR, "feature_order.pkl"))
        numerical_features = joblib.load(os.path.join(ARTIFACTS_DIR, "numerical_features.pkl"))
        categorical_features = joblib.load(os.path.join(ARTIFACTS_DIR, "categorical_features.pkl"))
        print(f"[OK] Backend successfully loaded ML artifacts from: {ARTIFACTS_DIR}")
    except Exception as e:
        print(f"[ERROR] Failed to load model artifacts: {e}")
        raise RuntimeError(f"Could not load artifacts from {ARTIFACTS_DIR}. Ensure you run train_and_export.py first.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML artifacts
    load_ml_artifacts()
    yield
    # Shutdown: Clean up resources if needed
    print("[INFO] Shutting down Bank Marketing API server...")

app = FastAPI(
    title="Bank Marketing Campaign Prediction API",
    description="Machine Learning API predicting customer term deposit subscriptions",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_customer_data(data: CustomerData) -> pd.DataFrame:
    """Transforms raw customer dictionary into encoded and scaled model input DataFrame."""
    cust_dict = data.model_dump()
    df = pd.DataFrame([cust_dict])

    # 1. Encode categorical features
    for col in categorical_features:
        le = encoders[col]
        val = str(df[col].iloc[0])
        if val in le.classes_:
            df[col] = le.transform([val])[0]
        else:
            # Fallback to class 0
            df[col] = 0

    # 2. Scale numerical features
    df[numerical_features] = scaler.transform(df[numerical_features])

    # 3. Reorder columns to match exact training structure
    return df[feature_order]

@app.get("/", tags=["Health"])
def root():
    return {
        "status": "online",
        "service": "Bank Marketing Campaign Prediction API",
        "endpoints": {
            "health": "/health",
            "metadata": "/features",
            "predict": "/predict (POST)",
            "docs": "/docs"
        }
    }

@app.get("/health", tags=["Health"])
def health_check():
    if model is None or scaler is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifacts are not loaded"
        )
    return {"status": "healthy", "model_loaded": True}

@app.get("/features", tags=["Metadata"])
def get_features_info():
    return {
        "numerical_features": numerical_features,
        "categorical_features": categorical_features,
        "feature_order": feature_order
    }

@app.post("/predict", response_model=PredictionResponse, tags=["Inference"])
def predict_subscription(customer: CustomerData):
    try:
        # Preprocess customer record
        input_df = preprocess_customer_data(customer)

        # Generate class probabilities
        probabilities = model.predict_proba(input_df)[0]
        prob_subscribe = float(probabilities[1])

        # Prediction decision threshold = 0.5
        prediction = 1 if prob_subscribe >= 0.5 else 0
        label = "Yes" if prediction == 1 else "No"
        confidence = prob_subscribe if prediction == 1 else (1.0 - prob_subscribe)

        # Actionable business recommendation
        if prediction == 1:
            if prob_subscribe >= 0.75:
                rec = "High-priority prospect. Assign experienced relationship manager immediately."
            else:
                rec = "Moderate-priority prospect. Include in personalized digital direct marketing."
        else:
            if prob_subscribe <= 0.20:
                rec = "Low-probability lead. Avoid expensive telemarketing calls to minimize operational cost."
            else:
                rec = "Borderline candidate. Consider follow-up email campaign before direct calling."

        return PredictionResponse(
            prediction=prediction,
            prediction_label=label,
            subscription_probability=round(prob_subscribe, 4),
            confidence_score=round(confidence * 100.0, 2),
            recommendation=rec
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
