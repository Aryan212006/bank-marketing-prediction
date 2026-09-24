# BankWise AI — Comprehensive Viva Preparation Manual
**Institution:** Darshan University, Computer Engineering Department  
**Project:** BankWise AI — Intelligent Bank Marketing Prediction & Customer Analytics  

---

## LEVEL 1 — BASIC VIVA QUESTIONS

### Q1: What is the Bank Marketing dataset?
- **Short Answer:** It is a benchmark direct marketing dataset from the UCI Machine Learning Repository containing 45,211 customer contacts from a Portuguese banking institution promoting term deposits.
- **Detailed Answer:** The dataset captures telephone interactions between bank marketing representatives and clients. It includes 16 client demographic, financial, and campaign features (such as age, job, balance, previous outcome, and call duration) with the objective of predicting whether the client will subscribe to a bank term deposit (`yes` or `no`).
- **Possible Follow-up:** *What is the exact target distribution in this dataset?*  
  *Follow-up Answer:* Only 5,289 clients (~11.7%) subscribed (`yes`), while 39,922 (~88.3%) declined (`no`), presenting a severe class imbalance.

---

### Q2: What is the target variable and what type of machine learning problem is this?
- **Short Answer:** The target variable is `y` (binary: `yes` = 1, `no` = 0). This is a supervised binary classification problem.
- **Detailed Answer:** Because each historical record contains known ground-truth labels indicating whether the customer subscribed, the algorithm learns a mapping function $f: X \to \{0, 1\}$ from feature vectors to discrete binary classes, making it a supervised classification task.
- **Possible Follow-up:** *Could this be treated as a regression problem?*  
  *Follow-up Answer:* Only if we framed the target as predicting the continuous amount deposited or probability directly; however, because the ground truth is a discrete decision (subscribed vs not subscribed), classification is the appropriate formulation.

---

### Q3: What is Data Preprocessing and why is it necessary?
- **Short Answer:** Data preprocessing converts raw, messy real-world data into a clean, structured numerical format suitable for machine learning algorithms.
- **Detailed Answer:** Raw data often contains non-numeric strings, varying numerical scales, outliers, and categorical categories that algorithms cannot process directly. Preprocessing handles encoding strings to numbers, standardizing scales to prevent feature dominance, and ensuring that no test set information leaks into training.
- **Possible Follow-up:** *What happens if you feed unscaled features to distance-based models like KNN or gradient models like Logistic Regression?*  
  *Follow-up Answer:* Features with large numerical ranges (like `balance` up to €100,000) will overpower features with small ranges (like `campaign` contacts 1–10), distorting Euclidean distance calculations and destabilizing gradient descent steps.

---

### Q4: Why encode categorical variables?
- **Short Answer:** Machine learning models rely on mathematical matrix operations and cannot perform numerical calculations directly on text strings.
- **Detailed Answer:** Categorical variables like `job`, `marital`, or `poutcome` represent distinct qualitative groups. We convert them into numerical integers using encoding strategies (such as Label Encoding or One-Hot Encoding) so that the mathematical equations (e.g. dot products $Xw$) can compute predictions.
- **Possible Follow-up:** *What is the difference between Label Encoding and One-Hot Encoding?*  
  *Follow-up Answer:* Label Encoding assigns an arbitrary integer (0, 1, 2, ...) to each class, which can accidentally introduce an artificial ordinal hierarchy. One-Hot Encoding creates separate binary dummy columns (0 or 1) for each category, preventing artificial order but increasing dimensionality.

---

## LEVEL 2 — INTERMEDIATE VIVA QUESTIONS

### Q5: Why is accuracy a misleading metric for the Bank Marketing dataset?
- **Short Answer:** Because of the heavy class imbalance (~88.3% `no` vs ~11.7% `yes`), a trivial model that blindly guesses `no` for every customer achieves 88.3% accuracy while finding zero subscribers.
- **Detailed Answer:** In marketing and fraud detection, the minority positive class is the primary class of interest. Accuracy treats all misclassifications identically. If a model fails to identify all 5,289 true subscribers, it has zero business utility, despite having an apparently high accuracy score of 88.3%.
- **Possible Follow-up:** *Which metrics did you use instead of accuracy?*  
  *Follow-up Answer:* We prioritized **Recall** (Sensitivity) on the subscriber class, **Precision**, **F1-Score** (harmonic mean of precision and recall), and **ROC-AUC** (discriminative capacity independent of arbitrary thresholds).

---

### Q6: Why did you choose Random Forest as your final model over Logistic Regression?
- **Short Answer:** Random Forest captures complex non-linear feature interactions, handles mixed categorical and continuous distributions gracefully, and supports class balancing natively.
- **Detailed Answer:** Customer banking decisions depend on non-linear combinations of factors (e.g., age interacting with balance and prior marketing outcomes). While Logistic Regression assumes a linear decision boundary, Random Forest builds an ensemble of decorrelated decision trees that effectively model non-linear boundaries. With `class_weight='balanced'`, it achieved an **ROC-AUC of 0.9245** and captured **84.12% of subscribers**, compared to only 22.59% recall for standard Logistic Regression.
- **Possible Follow-up:** *Did Random Forest overfit? How did you control it?*  
  *Follow-up Answer:* Default Random Forests can overfit deep leaves (train acc 95% vs test acc 90%). We controlled overfitting via `GridSearchCV` by constraining `max_depth=14` and enforcing `min_samples_split=20`.

---

### Q7: What is Cross-Validation and why is it preferred over a simple train-test split?
- **Short Answer:** Cross-validation partitions the training data into multiple folds to test model stability and ensure that performance is not an artifact of a lucky split.
- **Detailed Answer:** A single train-test split evaluates performance on only one subset, which may have high variance. In our project, we used **5-Fold Stratified Cross-Validation**. The dataset was split into 5 equal folds preserving the 11.7% class ratio. The model was trained on 4 folds and validated on the 5th, repeated 5 times. Our tuned Random Forest achieved a mean ROC-AUC of $0.9211$ with an exceptionally low standard deviation of $\pm 0.0021$, proving high model stability.
- **Possible Follow-up:** *Why is Stratified K-Fold specifically necessary here?*  
  *Follow-up Answer:* Standard K-Fold splits data randomly, which could result in some folds having too few positive subscriber instances. Stratified K-Fold guarantees that every fold contains exactly 11.7% positive instances.

---

### Q8: What is Hyperparameter Tuning and how did you implement it?
- **Short Answer:** Hyperparameter tuning searches for the optimal configuration of external model parameters that are not learned directly from training data.
- **Detailed Answer:** Model parameters (like weights $w$) are learned by gradient descent, but hyperparameters (like tree depth `max_depth` or number of trees `n_estimators`) must be set prior to training. We used **`GridSearchCV`** with 5-Fold Stratified CV across `n_estimators: [100, 150]`, `max_depth: [10, 14]`, and `min_samples_split: [10, 20]`. The best parameters were `{'class_weight': 'balanced', 'max_depth': 14, 'min_samples_split': 20, 'n_estimators': 150}`, boosting ROC-AUC to 0.9248.
- **Possible Follow-up:** *What is the difference between GridSearchCV and RandomizedSearchCV?*  
  *Follow-up Answer:* GridSearchCV exhaustively trains models for every possible combination in the grid (guaranteeing the optimal combination within the search space), while RandomizedSearchCV samples a fixed number of random parameter combinations (faster for large hyperparameter spaces).

---

## LEVEL 3 — ADVANCED VIVA QUESTIONS

### Q9: Explain your Scratch Logistic Regression algorithm mathematically.
- **Short Answer:** We implemented binary logistic regression in pure NumPy using the Sigmoid activation function, Binary Cross-Entropy log-loss, and analytical batch gradient descent.
- **Detailed Answer:**
  1. **Linear Model:** $z = Xw + b$, where $w \in \mathbb{R}^p$ and $b \in \mathbb{R}$.
  2. **Sigmoid Function:** $\hat{y} = \sigma(z) = \frac{1}{1 + e^{-z}}$, which maps $z \in (-\infty, \infty)$ into a valid probability $\hat{y} \in (0, 1)$. We implemented clipping to $[-500, 500]$ to prevent exponential floating-point overflow.
  3. **Loss Function (Binary Cross-Entropy):**
     $$J(w, b) = -\frac{1}{m} \sum_{i=1}^{m} \left[ y^{(i)} \ln(\hat{y}^{(i)}) + (1 - y^{(i)}) \ln(1 - \hat{y}^{(i)}) \right]$$
  4. **Derivatives (Gradient Computation):**
     Using the chain rule, $\frac{\partial J}{\partial w} = \frac{1}{m} X^T (\hat{y} - y)$ and $\frac{\partial J}{\partial b} = \frac{1}{m} \sum_{i=1}^{m} (\hat{y}^{(i)} - y^{(i)})$.
  5. **Parameter Update Rule:**
     $w := w - \alpha \frac{\partial J}{\partial w}, \quad b := b - \alpha \frac{\partial J}{\partial b}$ with learning rate $\alpha = 0.1$ across 1,000 iterations.
- **Possible Follow-up:** *How did its performance compare to Scikit-Learn?*  
  *Follow-up Answer:* On our leak-free test partition, our Scratch implementation achieved **88.95% accuracy** and **0.8649 ROC-AUC**, closely matching Scikit-Learn's **89.14% accuracy** and **0.8726 ROC-AUC**, mathematically validating our gradient descent convergence.

---

### Q10: How does your preprocessing pipeline strictly prevent Data Leakage?
- **Short Answer:** We execute the Stratified Train-Test Split *before* fitting any encoders or scalers, ensuring that parameters ($\mu, \sigma$, and category mappings) are computed solely from `X_train`.
- **Detailed Answer:** Data leakage occurs when information from outside the training dataset is used to create the model. If `StandardScaler` is fitted on the whole dataset, the test set's mean $\mu_{test}$ and variance $\sigma^2_{test}$ influence the scaling parameters. In BankWise AI:
  1. `train_test_split(..., stratify=y)` is called first.
  2. `scaler.fit_transform()` is called strictly on `X_train_raw`.
  3. `X_test_raw` is transformed using `scaler.transform()` (with frozen $\mu_{train}, \sigma_{train}$).
  4. Any unseen categories encountered in `X_test` are mapped to a fallback class index `0`.
- **Possible Follow-up:** *Why is data leakage dangerous in production?*  
  *Follow-up Answer:* Models with data leakage exhibit artificially inflated offline validation metrics. When deployed to a live server where future incoming data is genuinely unseen, model accuracy plummets.

---

### Q11: Explain your Optimal Decision Threshold Analysis.
- **Short Answer:** The standard classification threshold is 0.50. By analyzing the Precision-Recall curve, we demonstrated that threshold $t=0.70$ maximizes the F1-Score (0.6101), while threshold $t=0.20$ captures 96.79% of all subscribers.
- **Detailed Answer:** In real-world banking, operational constraints determine the best cutoff. If the bank has a limited telemarketing team, setting the threshold higher ($t = 0.70$) increases precision to **57.03%**, meaning nearly 6 out of every 10 calls succeed. Conversely, if the bank is running a high-priority product launch and wants to capture almost all potential revenue, setting $t = 0.20$ yields **96.79% Recall**.
- **Possible Follow-up:** *What is probability calibration and what was your Brier score?*  
  *Follow-up Answer:* Calibration measures whether a predicted probability of 80% actually converts 80% of the time. We evaluated the Brier Score (mean squared error of probability predictions), achieving **0.0999** (scores < 0.10 represent high-confidence calibration).

---

### Q12: How does the web client communicate with your Flask API during prediction?
- **Short Answer:** The browser collects form inputs, serializes them into a JSON payload, and makes an asynchronous `fetch()` POST request to `/predict`. Flask preprocesses the payload and returns JSON containing prediction, probability, confidence, and recommendations.
- **Detailed Answer:**
  1. The user inputs 16 customer fields on the frontend.
  2. `app.js` runs client-side validation and dispatches an HTTP POST request to `http://127.0.0.1:5000/predict`.
  3. Flask's endpoint passes the dictionary to `preprocess_customer_input()`, applying the frozen `encoders.pkl` and `scaler.pkl`.
  4. The serialized model `bank_model.pkl` runs `predict_proba()`.
  5. Flask returns a structured JSON response:
     ```json
     {
       "prediction": 1,
       "prediction_label": "Yes",
       "subscription_probability": 0.9808,
       "confidence_score": 98.08,
       "recommendation": "High-priority prospect. Contact immediately via senior relationship manager."
     }
     ```
  6. The frontend renders the decision banner, probability meter, and strategic action in < 20 milliseconds.
- **Possible Follow-up:** *What happens if the client sends an unknown category like job='astronaut'?*  
  *Follow-up Answer:* Our preprocessing function intercepts unseen values and maps them safely to index `0` instead of throwing an unhandled exception, ensuring 100% API uptime.
