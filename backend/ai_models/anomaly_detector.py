import numpy as np
from typing import Dict, List
from datetime import datetime


class AnomalyDetector:
    def __init__(self):
        self.is_trained = False
        self.feature_stats = {}

    def extract_features(self, transaction: Dict) -> np.ndarray:
        """Extract normalized numerical features from a transaction"""
        features = []

        # Amount (normalized)
        amount = transaction.get("amount", 0)
        features.append(amount / 100000)

        # Approval time (hours)
        approval_time = transaction.get("approval_time_hours", 24)
        features.append(approval_time / 168)

        # Time-based features
        try:
            timestamp = datetime.fromisoformat(
                transaction.get("timestamp", datetime.now().isoformat())
            )
            features.append(timestamp.hour / 24)
            features.append(timestamp.weekday() / 7)
        except Exception:
            features.append(0.5)
            features.append(0.5)

        return np.array(features)

    def train(self, transactions: List[Dict]):
        """Train statistical anomaly detector"""
        if len(transactions) < 10:
            print("⚠️ Not enough data to train anomaly detector")
            return

        X = np.array([self.extract_features(t) for t in transactions])

        # Compute mean and std for each feature
        self.feature_stats = {
            "mean": np.mean(X, axis=0),
            "std": np.std(X, axis=0) + 1e-6  # prevent divide by zero
        }

        self.is_trained = True
        print("✅ Anomaly detector trained")

    def predict(self, transaction: Dict) -> Dict:
        """Detect anomaly using z-score method"""
        if not self.is_trained:
            return {
                "is_anomalous": False,
                "anomaly_score": 0.3,
                "reasons": ["Model not trained yet"]
            }

        X = self.extract_features(transaction)

        # Z-score calculation
        z_scores = np.abs((X - self.feature_stats["mean"]) / self.feature_stats["std"])

        anomaly_score = float(np.max(z_scores))
        is_anomalous = anomaly_score > 2.5

        reasons = []

        amount = transaction.get("amount", 0)
        approval_time = transaction.get("approval_time_hours", 24)

        if anomaly_score > 2.5:
            if z_scores[0] > 2:
                reasons.append("Unusual transaction amount")

            if z_scores[1] > 2:
                reasons.append("Unusual approval speed")

        if not reasons:
            reasons = ["Statistical outlier detected"] if is_anomalous else ["Normal pattern"]

        return {
            "is_anomalous": bool(is_anomalous),
            "anomaly_score": float(anomaly_score),
            "reasons": reasons
        }

    def batch_predict(self, transactions: List[Dict]) -> List[Dict]:
        """Predict anomalies for multiple transactions"""
        return [self.predict(t) for t in transactions]


# Global instance
anomaly_detector = AnomalyDetector()
