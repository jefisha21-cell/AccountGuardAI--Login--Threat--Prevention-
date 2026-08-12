import joblib
import pandas as pd

# -----------------------------
# Load Saved Model
# -----------------------------

model = joblib.load("models/fraud_model.pkl")

encoders = joblib.load("models/encoders.pkl")

label_encoder = joblib.load("models/label_encoder.pkl")


# -----------------------------
# Safe encode — maps unknown values to a known fallback
# -----------------------------

def _safe_encode(encoder, value, fallback):
    """Return encoded value, or encoded fallback if value is unseen."""
    if value not in encoder.classes_:
        value = fallback
    return encoder.transform([value])[0]


# -----------------------------
# Prediction Function
# -----------------------------

def predict_risk(
    browser,
    device,
    operating_system,
    location,
    login_hour,
    failed_attempts,
    new_device,
    new_location
):

    # -----------------------------
    # Encode Browser
    # -----------------------------

    browser = _safe_encode(encoders["browser"], browser, "Chrome")

    # -----------------------------
    # Encode Device
    # -----------------------------

    device = _safe_encode(encoders["device"], device, "Desktop")

    # -----------------------------
    # Encode Operating System
    # -----------------------------

    operating_system = _safe_encode(encoders["operating_system"], operating_system, "Windows")

    # -----------------------------
    # Encode Location
    # -----------------------------

    location = _safe_encode(encoders["location"], location, "Unknown")

    # -----------------------------
    # Encode New Device
    # -----------------------------

    new_device = _safe_encode(encoders["new_device"], new_device, "No")

    # -----------------------------
    # Encode New Location
    # -----------------------------

    new_location = _safe_encode(encoders["new_location"], new_location, "No")

    # -----------------------------
    # Prepare Data
    # -----------------------------

    input_data = pd.DataFrame([{

        "browser": browser,
        "device": device,
        "operating_system": operating_system,
        "location": location,
        "login_hour": login_hour,
        "failed_attempts": failed_attempts,
        "new_device": new_device,
        "new_location": new_location

    }])

    # -----------------------------
    # Prediction
    # -----------------------------

    prediction = model.predict(input_data)

    label = label_encoder.inverse_transform(prediction)

    return label[0]