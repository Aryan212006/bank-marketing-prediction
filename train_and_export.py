import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier

def main():
    print("Step 1: Creating saved_models folder...")
    os.makedirs("saved_models", exist_ok=True)

    print("Step 2: Loading bank-full.csv dataset...")
    raw_df = pd.read_csv("bank-full.csv", sep=";")

    # Clean target: yes -> 1, no -> 0
    raw_df['y'] = raw_df['y'].map({'yes': 1, 'no': 0})

    X_raw = raw_df.drop('y', axis=1)
    y_raw = raw_df['y']

    print("Step 3: Performing stratified Train-Test Split (80-20)...")
    X_train_raw, X_test_raw, y_train_raw, y_test_raw = train_test_split(
        X_raw, y_raw, test_size=0.2, random_state=42, stratify=y_raw
    )

    # Column specifications
    numerical_features = ['age', 'balance', 'day', 'duration', 'campaign', 'pdays', 'previous']
    categorical_features = ['job', 'marital', 'education', 'default', 'housing', 'loan', 'contact', 'month', 'poutcome']
    feature_order = list(X_raw.columns)

    print("Step 4: Fitting LabelEncoders on training data...")
    encoders = {}
    X_train_processed = X_train_raw.copy()

    for col in categorical_features:
        le = LabelEncoder()
        # Include all possible values from training set
        unique_vals = list(X_train_raw[col].astype(str).unique())
        le.fit(unique_vals)
        X_train_processed[col] = le.transform(X_train_raw[col].astype(str))
        encoders[col] = le

    print("Step 5: Fitting StandardScaler on training numerical features...")
    scaler = StandardScaler()
    X_train_processed[numerical_features] = scaler.fit_transform(X_train_processed[numerical_features])

    X_train_final = X_train_processed[feature_order]

    print("Step 6: Training Balanced Random Forest Classifier...")
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=12,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_final, y_train_raw)

    print("Step 7: Serializing artifacts to saved_models/...")
    joblib.dump(model, "saved_models/bank_model.pkl")
    joblib.dump(scaler, "saved_models/scaler.pkl")
    joblib.dump(encoders, "saved_models/encoders.pkl")
    joblib.dump(feature_order, "saved_models/feature_order.pkl")
    joblib.dump(numerical_features, "saved_models/numerical_features.pkl")
    joblib.dump(categorical_features, "saved_models/categorical_features.pkl")

    print("SUCCESS: All models and preprocessing artifacts successfully exported!")

if __name__ == "__main__":
    main()
