import joblib
import os

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "../models/fraud_model.pkl"
)

model = joblib.load(MODEL_PATH)


def predict_fraud(features):

    prediction = model.predict([features])

    if prediction[0] == -1:
        return 90
    else:
        return 20