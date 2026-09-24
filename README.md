# BankWise AI — Intelligent Bank Marketing Prediction & Customer Analytics

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask%203.x-black.svg)](https://flask.palletsprojects.com/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn%201.4%2B-orange.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-Academic-green.svg)]()

> **Darshan University, Computer Engineering Department**  
> **Course:** Machine Learning Project (Academic Year 2025–26)  
> **SOP Reference:** Standard Operating Procedure for Student Project Allocation, Execution & Monitoring (Phase 1: Weeks 1–12)  
> **Dataset:** UCI Machine Learning Repository — Bank Marketing Campaign (#222)  

---

## 🌟 Executive Overview
Direct telephone marketing campaigns remain an effective channel for retail banks to promote term deposits; however, unassisted calling suffers from severe class imbalance (~11.7% conversion) and high operational costs. 

**BankWise AI** is an intelligent, end-to-end Machine Learning system that predicts customer propensity to subscribe to bank term deposits *before* placing sales calls. It provides relationship managers with real-time conversion probabilities, actionable recommendations, and explainable feature importances.

---

## 🏛️ Academic SOP Compliance Summary (Weeks 1–12)

| Week | Requirement | Implementation in BankWise AI | Status |
| :--- | :--- | :--- | :--- |
| **Week 1** | Problem Definition & Dataset Exploration | Comprehensive Markdown Header in `Bank_Project_ML.ipynb`, full 16-feature dictionary, and demographic distributions. | ✅ **COMPLETED** |
| **Week 2** | Data Cleaning, Leak-Free Pipeline & EDA | Stratified 80/20 train-test split executed **first**; `StandardScaler` and `LabelEncoder` fitted strictly on `X_train`. | ✅ **COMPLETED** |
| **Week 3** | Algorithm Selection & Mandatory Scratch Model | Implemented `CustomLogisticRegression` in pure NumPy (Sigmoid, Binary Cross-Entropy loss, Gradient Descent). Matches Sklearn (88.95% vs 89.14%). | ✅ **COMPLETED** |
| **Week 4** | Model Evaluation & Overfitting Analysis | Benchmarked Scratch LR, Sklearn LR, Decision Tree, Random Forest (Standard & Balanced), and KNN across Accuracy, Precision, Recall, F1, and ROC-AUC. | ✅ **COMPLETED** |
| **Week 5** | 5-Fold Stratified CV & Hyperparameter Tuning | 5-Fold Stratified Cross-Validation ($AUC = 0.9211 \pm 0.0021$) and `GridSearchCV` on Random Forest yielding **84.12% Recall** and **0.9245 ROC-AUC**. | ✅ **COMPLETED** |
| **Week 6** | Modern Frontend Interface | Modern Glassmorphic Dashboard with 5 Views: Dashboard, Customer Prediction, Model Analytics (SOP p. 8), Dataset Insights (SOP p. 9), and About. | ✅ **COMPLETED** |
| **Week 7** | Backend Development & Deployment | SOP-compliant **Flask 3.x REST API** (`backend/flask_app.py`) with full CORS support and FastAPI compatibility (`backend/app.py`). | ✅ **COMPLETED** |
| **Week 8** | Complete System Evaluation & Testing | Automated test suite (`tests/test_system.py`) covering 9 integration tests (boundary values, unseen categories, latency < 100ms). | ✅ **COMPLETED** |
| **Week 9** | Advanced ML Extension (Non-DL SOP Adaptation) | Optimal decision threshold tuning ($t=0.70$ gives peak F1 0.6101; $t=0.20$ catches 96.79% of subscribers) and Brier Score calibration (0.0999). | ✅ **COMPLETED** |
| **Week 10** | Model Explainability & Analytics | Permutation feature importance analysis and dynamic Gini importance visualization (`saved_models/feature_importance.json`). | ✅ **COMPLETED** |
| **Week 11** | Final System Integration | End-to-end verification connecting UI, Flask API, frozen preprocessors, and inference engine. | ✅ **COMPLETED** |
| **Week 12** | Final Documentation & Viva Preparation | Complete IEEE-format Project Report, 27-Slide presentation structure, and 3-Level Viva Q&A Manual. | ✅ **COMPLETED** |

> **Faculty Notice (SOP Adaptation):**  
> As formally specified in student project scope, this project specializes entirely in the tabular **Machine Learning Bank Marketing Project (Weeks 1–12)**. Deep Learning / CNN models (Phase 2) are intentionally omitted in favor of advanced classical ML depth (NumPy scratch algorithm, GridSearchCV, cross-validation, and threshold tuning).

---

## 📊 Measured Benchmark Results (Zero Data Leakage)

All metrics below are derived from actual execution on the unseen test partition ($N = 9,043$):

```
========================================================================================
MODEL NAME                    TRAIN ACC   TEST ACC   PRECISION   RECALL (y=1)   F1-SCORE   ROC-AUC
========================================================================================
Logistic Regression (Sklearn)   89.10%     89.14%      59.45%       22.59%       32.74%    0.8726
Logistic Regression (Scratch)   89.03%     88.95%      58.17%       19.85%       29.60%    0.8649
Decision Tree                   91.37%     90.27%      63.65%       39.22%       48.54%    0.8781
Random Forest (Standard)        94.94%     90.58%      67.76%       37.15%       47.99%    0.9236
Random Forest (Balanced)        88.31%     85.35%      43.42%       83.27%       57.08%    0.9197
KNN (k=7)                       91.69%     89.77%      61.94%       32.61%       42.72%    0.8430
----------------------------------------------------------------------------------------
TUNED RANDOM FOREST (GRIDSEARCH)88.42%     85.22%      43.22%       84.12%       57.11%    0.9245
========================================================================================
```

---

## 🛠️ Project Directory Structure

```
BankWiseAI/
│
├── Bank_Project_ML.ipynb         # Complete master research notebook (Weeks 1–5)
├── bank-full.csv                 # Raw UCI Bank Marketing dataset (45,211 rows)
├── bank_preprocessed.csv         # Cleaned preprocessed dataset
├── advanced_ml_extension.py      # Threshold tuning, calibration, & permutation importance
│
├── backend/
│   ├── flask_app.py              # SOP-compliant Flask 3.x REST API (Port 5000)
│   ├── app.py                    # High-throughput FastAPI alternative (Port 8000)
│   ├── schemas.py                # Pydantic input/output schemas
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   ├── index.html                # Modern multi-tab glassmorphic user interface
│   ├── style.css                 # Responsive stylesheet
│   ├── app.js                    # Dynamic frontend controller & auto-fallback
│   └── package.json              # Local preview scripts
│
├── saved_models/
│   ├── bank_model.pkl            # Final Tuned Random Forest (GridSearchCV)
│   ├── scaler.pkl                # Frozen StandardScaler (X_train only)
│   ├── encoders.pkl              # Frozen LabelEncoders (X_train only)
│   ├── feature_order.pkl         # 16-feature sequential schema
│   ├── numerical_features.pkl    # Numerical features list
│   ├── categorical_features.pkl  # Categorical features list
│   └── feature_importance.json   # Exported Gini feature importances
│
├── tests/
│   └── test_system.py            # Automated test suite (9 integration tests)
│
├── documentation/
│   ├── PROJECT_REPORT.md         # Comprehensive IEEE-format academic project report
│   ├── PRESENTATION_PLAN.md      # 27-Slide presentation structure
│   ├── VIVA_PREPARATION_GUIDE.md # 3-Level Viva Q&A Manual (Basic, Intermediate, Advanced)
│   └── advanced_ml_results.json  # Raw JSON outputs of threshold & permutation tests
│
└── README.md                     # Master documentation
```

---

## 🚀 Quick Start Guide

### 1. Installation
Ensure Python 3.10+ is installed. Install backend dependencies:
```bash
pip install -r backend/requirements.txt
```

### 2. Start the Backend API
Start the department SOP-compliant Flask REST API:
```bash
python backend/flask_app.py
```
*The API will start on `http://127.0.0.1:5000` with endpoints `/health`, `/api/features`, `/api/analytics`, and `/predict`.*

*(Optional: You can also run the FastAPI server on port 8000 using `python backend/app.py`).*

### 3. Open the Frontend
Open `frontend/index.html` directly in any web browser, or launch a local server:
```bash
cd frontend
python -m http.server 3000
```
Navigate to `http://localhost:3000`. The frontend will automatically detect the backend and display `API: Online (Flask)`.

### 4. Run Automated Test Suite
To verify system integrity, run the automated test suite:
```bash
python -m unittest tests/test_system.py
```
*Expected: 9/9 tests pass in < 1 second.*

---

## 🎯 Faculty Demonstration Checklist
During project demonstration and viva, present the project in this sequence:
1. **Academic Notebook (`Bank_Project_ML.ipynb`):**
   - Show the Week 1 Academic Header & Feature Dictionary.
   - Show the Week 2 Data Leakage Prevention (train-test split before scaling).
   - Show the Week 3 Scratch Logistic Regression class and its loss convergence plot.
   - Show the Week 4 Comparative ROC Curves and Confusion Matrices.
   - Show Week 5 5-Fold Stratified Cross-Validation and GridSearchCV results.
2. **Automated Testing:**
   - Run `python -m unittest tests/test_system.py` in the terminal to demonstrate 100% test pass rate.
3. **Interactive Web Dashboard (`frontend/index.html`):**
   - Click **"Load High-Propensity Sample"** and click **"Predict Subscription"**. Show the instant AI decision (Probability: ~98.1%, Decision: YES).
   - Navigate to the **"Model Analytics"** tab to show the Tuned Hyperparameters and Top Feature Importances (SOP Page 8).
   - Navigate to the **"Dataset Insights"** tab to show the Class Imbalance breakdown and key domain takeaways (SOP Page 9).
4. **Viva Defense:**
   - Refer to `documentation/VIVA_PREPARATION_GUIDE.md` for answers to Level 1, 2, and 3 faculty questions.
