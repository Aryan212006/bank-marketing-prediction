"""
Automated Test Suite for BankWise AI System
Covers Week 8 ML System Evaluation: Preprocessing, Edge Cases, Model Probabilities, and API Validation.
"""
import os
import sys
import warnings

# Suppress NumPy/Joblib version warnings for clean test output
warnings.filterwarnings("ignore")

import unittest
import json
import joblib
import pandas as pd
import numpy as np

# Add project root and backend to path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
backend_path = os.path.join(BASE_DIR, "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

try:
    from backend.flask_app import app, preprocess_customer_input
except ModuleNotFoundError:
    from flask_app import app, preprocess_customer_input

class TestBankWiseAISystem(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        """Set up test fixtures: load artifacts and test client."""
        cls.client = app.test_client()
        cls.artifacts_dir = os.path.join(BASE_DIR, "saved_models")
        cls.model = joblib.load(os.path.join(cls.artifacts_dir, "bank_model.pkl"))
        cls.scaler = joblib.load(os.path.join(cls.artifacts_dir, "scaler.pkl"))
        cls.encoders = joblib.load(os.path.join(cls.artifacts_dir, "encoders.pkl"))
        cls.feature_order = joblib.load(os.path.join(cls.artifacts_dir, "feature_order.pkl"))

    def test_01_artifacts_integrity(self):
        """Test that all required serialization artifacts exist and are non-empty."""
        expected_files = [
            "bank_model.pkl", "scaler.pkl", "encoders.pkl",
            "feature_order.pkl", "numerical_features.pkl", "categorical_features.pkl",
            "feature_importance.json"
        ]
        for f in expected_files:
            file_path = os.path.join(self.artifacts_dir, f)
            self.assertTrue(os.path.exists(file_path), f"Artifact missing: {f}")
            self.assertGreater(os.path.getsize(file_path), 0, f"Artifact empty: {f}")

    def test_02_health_endpoint(self):
        """Test GET /health returns HTTP 200 and healthy status."""
        res = self.client.get("/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertTrue(data.get("model_loaded"))

    def test_03_analytics_endpoint(self):
        """Test GET /api/analytics returns valid model metrics and feature importance."""
        res = self.client.get("/api/analytics")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("model_info", data)
        self.assertIn("performance", data["model_info"])
        self.assertIn("feature_importance", data)
        self.assertGreater(len(data["feature_importance"]), 0)

    def test_04_valid_prediction_high_propensity(self):
        """Test POST /predict with a strong positive profile (long duration, previous success)."""
        payload = {
            "age": 42,
            "job": "management",
            "marital": "married",
            "education": "tertiary",
            "default": "no",
            "balance": 6500.0,
            "housing": "no",
            "loan": "no",
            "contact": "cellular",
            "day": 18,
            "month": "sep",
            "duration": 680,
            "campaign": 1,
            "pdays": 90,
            "previous": 2,
            "poutcome": "success"
        }
        res = self.client.post("/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("prediction"), 1)
        self.assertEqual(data.get("prediction_label"), "Yes")
        self.assertGreater(data.get("subscription_probability"), 0.5)

    def test_05_valid_prediction_low_propensity(self):
        """Test POST /predict with a low-conversion profile (short duration, housing loan, unknown contact)."""
        payload = {
            "age": 25,
            "job": "blue-collar",
            "marital": "single",
            "education": "primary",
            "default": "yes",
            "balance": -100.0,
            "housing": "yes",
            "loan": "yes",
            "contact": "unknown",
            "day": 5,
            "month": "may",
            "duration": 30,
            "campaign": 8,
            "pdays": -1,
            "previous": 0,
            "poutcome": "unknown"
        }
        res = self.client.post("/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("prediction"), 0)
        self.assertEqual(data.get("prediction_label"), "No")
        self.assertLess(data.get("subscription_probability"), 0.5)

    def test_06_edge_case_boundary_values(self):
        """Test boundary conditions: minimum legal age (18), zero duration, zero balance."""
        payload = {
            "age": 18,
            "job": "student",
            "marital": "single",
            "education": "secondary",
            "default": "no",
            "balance": 0.0,
            "housing": "no",
            "loan": "no",
            "contact": "cellular",
            "day": 1,
            "month": "aug",
            "duration": 0,
            "campaign": 1,
            "pdays": -1,
            "previous": 0,
            "poutcome": "unknown"
        }
        res = self.client.post("/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("prediction", data)
        self.assertIn("subscription_probability", data)

    def test_07_edge_case_unseen_category(self):
        """Test fallback handling when input contains an unseen or unrecognized category."""
        payload = {
            "age": 35,
            "job": "astronaut",  # Unseen category
            "marital": "married",
            "education": "tertiary",
            "default": "no",
            "balance": 1500.0,
            "housing": "no",
            "loan": "no",
            "contact": "cellular",
            "day": 15,
            "month": "jun",
            "duration": 300,
            "campaign": 2,
            "pdays": -1,
            "previous": 0,
            "poutcome": "unknown"
        }
        # Preprocessor should safely handle unseen category without crashing
        res = self.client.post("/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 200)

    def test_08_error_handling_missing_fields(self):
        """Test validation fails with HTTP 422 when required fields are missing."""
        payload = {
            "age": 35,
            "job": "management"
            # Missing remaining 14 fields
        }
        res = self.client.post("/predict", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 422)
        data = res.get_json()
        self.assertIn("error", data)

    def test_09_inference_latency(self):
        """Test that single inference completes within acceptable SLA (< 200ms)."""
        import time
        payload = {
            "age": 40, "job": "services", "marital": "married", "education": "secondary",
            "default": "no", "balance": 1200.0, "housing": "yes", "loan": "no",
            "contact": "cellular", "day": 10, "month": "jul", "duration": 250,
            "campaign": 1, "pdays": -1, "previous": 0, "poutcome": "unknown"
        }
        # Warmup calls to initialize memory structures
        for _ in range(2):
            self.client.post("/predict", data=json.dumps(payload), content_type="application/json")
            
        start = time.perf_counter()
        res = self.client.post("/predict", data=json.dumps(payload), content_type="application/json")
        latency_ms = (time.perf_counter() - start) * 1000.0
        self.assertEqual(res.status_code, 200)
        self.assertLess(latency_ms, 200.0, f"Inference took {latency_ms:.2f}ms, exceeded 200ms limit")

if __name__ == "__main__":
    unittest.main(verbosity=2)
