import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# -----------------------------
# Load Dataset
# -----------------------------

df = pd.read_csv("dataset/login_dataset.csv")

print("Dataset Loaded Successfully")
print(df.head())

# -----------------------------
# Encode Categorical Columns
# -----------------------------

label_encoders = {}

categorical_columns = [
    "browser",
    "device",
    "operating_system",
    "location",
    "new_device",
    "new_location"
]

for column in categorical_columns:
    encoder = LabelEncoder()
    df[column] = encoder.fit_transform(df[column])
    label_encoders[column] = encoder

# Encode Label

label_encoder = LabelEncoder()
df["label"] = label_encoder.fit_transform(df["label"])

# -----------------------------
# Features & Target
# -----------------------------

X = df.drop(["employee_id", "label"], axis=1)

y = df["label"]

# -----------------------------
# Split Dataset
# -----------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# -----------------------------
# Train Model
# -----------------------------

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# Test Model
# -----------------------------

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print("\nModel Accuracy:", accuracy)

print("\nClassification Report\n")

print(classification_report(y_test, predictions))

# -----------------------------
# Save Model
# -----------------------------

joblib.dump(model, "models/fraud_model.pkl")

joblib.dump(label_encoders, "models/encoders.pkl")

joblib.dump(label_encoder, "models/label_encoder.pkl")

print("\nModel Saved Successfully!")