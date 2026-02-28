import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, List
import pickle
import os

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        self.is_trained = False
        self.feature_stats = {}
        
    def extract_features(self, transaction: Dict) -> np.array:
        """Extract features from transaction"""
        features = []
        
        # Amount (normalized)
        amount = transaction.get('amount', 0)
        features.append(amount / 100000)  # Normalize
        
        # Approval time (hours)
        approval_time = transaction.get('approval_time_hours', 24)
        features.append(approval_time / 168)  # Normalize to week
        
        # Time-based features
        try:
            from datetime import datetime
            timestamp = datetime.fromisoformat(transaction.get('timestamp', datetime.now().isoformat()))
            features.append(timestamp.hour / 24)  # Hour of day
            features.append(timestamp.weekday() / 7)  # Day of week
        except:
            features.append(0.5)
            features.append(0.5)
        
        return np.array(features).reshape(1, -1)
    
    def train(self, transactions: List[Dict]):
        """Train anomaly detection model"""
        if len(transactions) < 10:
            print("⚠️  Not enough data to train anomaly detector")
            return
        
        X = np.vstack([self.extract_features(t) for t in transactions])
        self.model.fit(X)
        self.is_trained = True
        
        # Calculate statistics
        self.feature_stats = {
            'amount_mean': np.mean([t['amount'] for t in transactions]),
            'amount_std': np.std([t['amount'] for t in transactions]),
            'approval_time_mean': np.mean([t.get('approval_time_hours', 24) for t in transactions]),
            'approval_time_std': np.std([t.get('approval_time_hours', 24) for t in transactions])
        }
        
        print("✅ Anomaly detector trained")
    
    def predict(self, transaction: Dict) -> Dict:
        """Predict if transaction is anomalous"""
        if not self.is_trained:
            # Return default for untrained model
            return {
                'is_anomalous': False,
                'anomaly_score': 0.3,
                'reasons': ['Model not trained yet']
            }
        
        X = self.extract_features(transaction)
        prediction = self.model.predict(X)[0]
        score_samples = self.model.score_samples(X)[0]
        
        # Convert to 0-1 score (higher = more anomalous)
        anomaly_score = 1 / (1 + np.exp(score_samples))
        
        is_anomalous = prediction == -1
        
        # Identify reasons
        reasons = []
        amount = transaction.get('amount', 0)
        approval_time = transaction.get('approval_time_hours', 24)
        
        if self.feature_stats:
            amount_zscore = abs(amount - self.feature_stats['amount_mean']) / (self.feature_stats['amount_std'] + 1)
            if amount_zscore > 2:
                reasons.append(f"Unusual amount (z-score: {amount_zscore:.2f})")
            
            time_zscore = abs(approval_time - self.feature_stats['approval_time_mean']) / (self.feature_stats['approval_time_std'] + 1)
            if time_zscore > 2:
                reasons.append(f"Unusual approval speed ({approval_time:.1f}h vs avg {self.feature_stats['approval_time_mean']:.1f}h)")
        
        if not reasons:
            reasons = ['Statistical outlier detected']
        
        return {
            'is_anomalous': is_anomalous,
            'anomaly_score': float(anomaly_score),
            'reasons': reasons
        }
    
    def batch_predict(self, transactions: List[Dict]) -> List[Dict]:
        """Predict anomalies for multiple transactions"""
        return [self.predict(t) for t in transactions]

# Global instance
anomaly_detector = AnomalyDetector()
