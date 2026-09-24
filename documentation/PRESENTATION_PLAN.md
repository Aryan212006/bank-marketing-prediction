# BankWise AI — Presentation Slide Deck Plan (27 Slides)
**Institution:** Darshan University, Computer Engineering Department  
**Project:** BankWise AI — Intelligent Bank Marketing Prediction & Customer Analytics  

---

### Slide 1 — Project Title
- **Title:** BankWise AI — Intelligent Bank Marketing Prediction & Customer Analytics
- **Subtitle:** Maximizing Term Deposit Conversions Through Machine Learning & Behavioral Analytics
- **Student Details:** Computer Engineering Department (Academic Year 2025–26)
- **Mentor / Faculty:** Darshan University Computer Engineering Department

### Slide 2 — Problem Statement
- Direct telemarketing is expensive and intrusive when conducted blindly.
- In retail banking, average response rates to term deposit campaigns hover around ~11.7%.
- 88.3% of outbound sales calls are wasted, resulting in high staffing overhead and brand fatigue.
- **Challenge:** Can we accurately predict customer response *before* placing the call?

### Slide 3 — Motivation
- Direct telephone costs (staffing, telecommunications, infrastructure) scale linearly with call volume.
- Prioritizing customers with higher subscription propensity dramatically improves marketing ROI.
- Predictive screening preserves positive customer relationships by eliminating spam calling.

### Slide 4 — Objectives
1. Implement a leak-free end-to-end Machine Learning classification pipeline.
2. Develop a custom **Scratch Logistic Regression** algorithm using pure NumPy (SOP requirement).
3. Benchmark multiple classifiers and optimize recall on the minority class using class-balancing.
4. Execute 5-Fold Stratified Cross-Validation and `GridSearchCV` hyperparameter tuning.
5. Deploy an interactive Modern UI Dashboard backed by a Flask REST API.

### Slide 5 — Proposed System Architecture
- Flow: Raw UCI Data → Stratified Split (80/20) → Preprocessing Pipeline (Fit strictly on Train) → Multiple Classifiers & Scratch Model → GridSearchCV Optimization → Model Serialization → Flask REST API → Glassmorphism Web Frontend.

### Slide 6 — Dataset Overview
- **Dataset:** UCI Machine Learning Repository Bank Marketing Dataset (#222).
- **Size:** 45,211 rows × 17 features.
- **Target Variable:** `y` (Binary: `yes` = 1, `no` = 0).
- **Class Breakdown:** 39,922 `no` (88.3%) vs 5,289 `yes` (11.7%).

### Slide 7 — Data Preprocessing & Leakage Prevention
- **Crucial Rule:** Zero Data Leakage.
- Stratified 80/20 Split performed **first** to freeze test distributions.
- Categorical features encoded with `LabelEncoder` (fitted on `X_train` only, fallback for unseen classes).
- Numerical features scaled via `StandardScaler` (parameters $\mu, \sigma$ derived solely from `X_train`).

### Slide 8 — Exploratory Data Analysis (EDA)
- **Duration Factor:** Long contact durations (> 400s) correlate strongly with subscription.
- **Prior Outcomes:** `poutcome == 'success'` results in a ~64% subscription propensity.
- **Credit Liabilities:** Existing housing loan holders are 50% less likely to deposit.

### Slide 9 — Machine Learning Algorithms Selected
- **Logistic Regression:** Linear probabilistic baseline.
- **Decision Tree:** Non-linear rule-based partitioning.
- **Random Forest (Standard & Balanced):** Ensemble of decorrelated trees.
- **K-Nearest Neighbors (KNN):** Distance-based instance learning.

### Slide 10 — Scratch Algorithm Implementation (SOP Mandatory Constraint)
- Pure NumPy `CustomLogisticRegression` class (Zero Scikit-Learn in core logic).
- Sigmoid Activation: $\sigma(z) = \frac{1}{1 + e^{-z}}$.
- Binary Cross-Entropy Cost: $J(w, b) = -\frac{1}{m} \sum [y \ln \hat{y} + (1-y)\ln(1-\hat{y})]$.
- Batch Gradient Descent: $w := w - \alpha \frac{\partial J}{\partial w}, \quad b := b - \alpha \frac{\partial J}{\partial b}$.
- Proven Convergence: Test Accuracy **88.95%** (Scratch) vs **89.14%** (Scikit-Learn).

### Slide 11 — Model Evaluation Metrics
- Why Accuracy is Misleading: Predicting `no` blindly gives 88.3% accuracy but zero business value.
- Primary Metrics: Precision, Recall (Class 1), F1-Score, and ROC-AUC.
- Focus: Maximizing Recall to ensure bank does not miss interested clients.

### Slide 12 — Model Comparison Table (Actual Results)
- Comparison Table:
  - Logistic Regression (Sklearn): Acc = 89.14%, Recall = 22.59%, AUC = 0.8726
  - Logistic Regression (Scratch): Acc = 88.95%, Recall = 19.85%, AUC = 0.8649
  - Decision Tree: Acc = 90.27%, Recall = 39.22%, AUC = 0.8781
  - Random Forest (Standard): Acc = 90.58%, Recall = 37.15%, AUC = 0.9236
  - **Random Forest (Balanced):** Acc = 85.35%, **Recall = 83.27%**, **AUC = 0.9197**

### Slide 13 — Hyperparameter Tuning & Cross-Validation
- **5-Fold Stratified Cross-Validation:** RF Balanced ROC-AUC = $0.9211 \pm 0.0021$ (Highly stable).
- **GridSearchCV:** Optimized `n_estimators: 150`, `max_depth: 14`, `min_samples_split: 20`, `class_weight: balanced`.
- **Tuned Model Metrics:** Accuracy = 85.22%, Recall = **84.12%**, ROC-AUC = **0.9245**.

### Slide 14 — Final Model Selection
- Selected: **Tuned Balanced Random Forest Classifier**.
- Rationale: High discrimination power (ROC-AUC 0.9245) and captures 84.12% of actual buyers.
- Tradeoff accepted: Precision of 43.2% means out of 100 contacted leads, ~43 convert (compared to only 11 in blind calling—a **4x conversion multiplier**).

### Slide 15 — Model Explainability & Feature Importance
- **Top 5 Gini Features:** `duration` (47.7%), `month` (8.4%), `contact` (6.6%), `age` (5.4%), `poutcome` (5.1%).
- **Permutation Importance:** Confirms `duration` and `contact` remain dominant when features are randomly shuffled.

### Slide 16 — Advanced ML Extension (Non-DL SOP Scope Adaptation)
- **Optimal Decision Threshold Analysis:** Swept thresholds from 0.20 to 0.80.
- Peak F1-Score of **0.6101** achieved at threshold $t = 0.70$ (Precision = 57.0%, Recall = 65.6%).
- Probability Calibration: **Brier Score of 0.0999** confirms reliable posterior probability estimates.

### Slide 17 — System Architecture & Data Flow
- Diagram of browser client transmitting JSON to Flask REST API, executing pipeline transformation, querying frozen serialized pickle models, and responding in < 20ms.

### Slide 18 — Flask Backend Architecture
- Built with Flask 3.x and Flask-CORS.
- Endpoints: `/health`, `/api/features`, `/api/analytics`, and `/predict`.
- Fully decoupled, stateless, and container/cloud-ready.

### Slide 19 — Prediction Demo Walkthrough
- Walkthrough of the 16 customer input fields (Demographic, Current Campaign, Historical Contact).
- "Load High-Propensity Sample" demonstration (Age 42, Management, Cellular, Duration 680s).
- Instant AI Decision: Term Deposit Subscribed (Probability: 98.1%, Confidence: 98.1%).

### Slide 20 — Analytics Dashboard (SOP Pages 7–9 Alignment)
- Overview of the 5 interactive tabs:
  - Dashboard KPI metrics.
  - Customer Prediction Form.
  - Model Details & Hyperparameter Spec.
  - Dataset Insights & EDA distributions.
  - Academic About page.

### Slide 21 — Cloud Deployment
- Local live preview on `http://127.0.0.1:5000` (Flask) & `http://127.0.0.1:3000` (Frontend).
- Standardized container deployment recipe for free cloud platforms (Render, Railway, Hugging Face Spaces).

### Slide 22 — Verification & Automated Testing
- Automated test suite `tests/test_system.py`:
  - 9 automated unit and integration tests.
  - 100% pass rate in 0.66 seconds.
  - Validates boundary values, missing fields, schema errors, and latency.

### Slide 23 — Summary of Results
- Dataset: 45,211 rows analyzed without leakage.
- Scratch Model: 88.95% accuracy achieved using pure NumPy.
- Final Model: 84.12% subscriber recall, 0.9245 ROC-AUC.
- Business Benefit: **400% improvement in campaign conversion efficiency**.

### Slide 24 — Limitations
- `duration` dependency: Duration is only known after the call begins; useful for real-time call center guidance, but pre-call scoring must assume median duration estimates.
- Unrecorded values: Several features rely on `'unknown'` categorical placeholders.

### Slide 25 — Future Scope
- Integration with live VoIP telephony software to auto-populate duration during calls.
- Uplift modeling to identify consumers who only purchase when called.
- Multi-product cross-selling propensity models.

### Slide 26 — Conclusion
- Successfully fulfilled all requirements of the Darshan University ML Project SOP (Weeks 1–12).
- Delivered an end-to-end, mathematically grounded, and production-tested banking AI solution.

### Slide 27 — Questions & Answers (Q&A)
- Thank you to the Faculty Mentor, Evaluators, and Department of Computer Engineering.
- Floor open for viva questions.
