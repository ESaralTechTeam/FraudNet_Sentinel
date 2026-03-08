import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib

# Example training dataset
data = pd.DataFrame({
    "complaint_count":[0,1,5,2,6,1,4],
    "keyword_count":[0,1,3,0,4,0,2],
    "payment_amount":[5000,7000,15000,6000,20000,8000,12000],
    "duplicate_flag":[0,0,1,0,1,0,1]
})

model = IsolationForest(
    n_estimators=100,
    contamination=0.2,
    random_state=42
)

model.fit(data)

joblib.dump(model,"fraud_model.pkl")

print("Model trained and saved")