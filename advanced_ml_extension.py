"""
Week 9 & 10: Advanced Machine Learning Extension & Model Explainability
Covers:
1. Optimal Decision Threshold Tuning (Precision-Recall vs Cutoff)
2. Probability Calibration Assessment (Brier Score)
3. Permutation Feature Importance (Unbiased Feature Importance)
"""
import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.inspection import permutation_importance
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import precision_recall_curve, f1_score, accuracy_score, precision_score, recall_score, roc_auc_score, brier_score_loss

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "saved_models")

print("1. Loading raw dataset and trained preprocessors...")
df = pd.read_csv("bank-full.csv", sep=";")
df['y'] = df['y'].map({'yes': 1, 'no': 0})

X_raw = df.drop('y', axis=1)
y = df['y']

X_train_raw, X_test_raw, y_train, y_test = train_test_split(
    X_raw, y, test_size=0.2, random_state=42, stratify=y
)

encoders = joblib.load(os.path.join(ARTIFACTS_DIR, "encoders.pkl"))
scaler = joblib.load(os.path.join(ARTIFACTS_DIR, "scaler.pkl"))
feature_order = joblib.load(os.path.join(ARTIFACTS_DIR, "feature_order.pkl"))
num_cols = joblib.load(os.path.join(ARTIFACTS_DIR, "numerical_features.pkl"))
cat_cols = joblib.load(os.path.join(ARTIFACTS_DIR, "categorical_features.pkl"))
best_rf = joblib.load(os.path.join(ARTIFACTS_DIR, "bank_model.pkl"))

# Preprocess test set strictly with saved preprocessors
X_test_proc = X_test_raw.copy()
for col in cat_cols:
    le = encoders[col]
    X_test_proc[col] = X_test_proc[col].astype(str).map(lambda s: le.transform([s])[0] if s in le.classes_ else 0)
X_test_proc[num_cols] = scaler.transform(X_test_proc[num_cols])
X_test_final = X_test_proc[feature_order]

y_probs = best_rf.predict_proba(X_test_final)[:, 1]

print("\n2. Threshold Optimization Analysis (F1 vs Decision Threshold):")
thresholds = np.arange(0.2, 0.85, 0.05)
thresh_results = []
for t in thresholds:
    preds = (y_probs >= t).astype(int)
    f1 = f1_score(y_test, preds)
    prec = precision_score(y_test, preds, zero_division=0)
    rec = recall_score(y_test, preds)
    thresh_results.append({
        'Threshold': round(t, 2),
        'Precision': round(prec, 4),
        'Recall': round(rec, 4),
        'F1-Score': round(f1, 4)
    })

thresh_df = pd.DataFrame(thresh_results)
best_thresh_row = thresh_df.loc[thresh_df['F1-Score'].idxmax()]
print(thresh_df.to_string(index=False))
print(f"\n[OPTIMAL DECISION THRESHOLD]: {best_thresh_row['Threshold']} with Max F1-Score: {best_thresh_row['F1-Score']}")

print("\n3. Probability Calibration & Brier Score Evaluation:")
brier = brier_score_loss(y_test, y_probs)
print(f"Random Forest Brier Score (lower is better, 0 = perfect calibration): {brier:.4f}")

print("\n4. Permutation Feature Importance Analysis (Test Set):")
perm_imp = permutation_importance(best_rf, X_test_final, y_test, n_repeats=5, random_state=42, n_jobs=-1, scoring='roc_auc')
perm_df = pd.DataFrame({
    'Feature': feature_order,
    'Permutation_Mean_Drop': perm_imp.importances_mean,
    'Permutation_Std': perm_imp.importances_std
}).sort_values(by='Permutation_Mean_Drop', ascending=False)

print(perm_df.head(8).to_string(index=False))

# Export results to documentation folder
os.makedirs("documentation", exist_ok=True)
with open("documentation/advanced_ml_results.json", "w") as f:
    json.dump({
        "optimal_threshold": float(best_thresh_row['Threshold']),
        "max_f1_score": float(best_thresh_row['F1-Score']),
        "brier_score": float(brier),
        "threshold_curve": thresh_results,
        "permutation_importance": perm_df.to_dict(orient='records')
    }, f, indent=2)

print("\n[SUCCESS] Advanced ML results exported to documentation/advanced_ml_results.json")
