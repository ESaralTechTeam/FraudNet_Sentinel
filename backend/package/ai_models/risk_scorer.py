from typing import Dict, List
import numpy as np

class RiskScorer:
    def __init__(self):
        # Weights for different risk factors
        self.weights = {
            'duplicate_score': 0.35,
            'anomaly_score': 0.30,
            'network_centrality': 0.20,
            'complaint_severity': 0.15
        }
    
    def calculate_risk_score(self, signals: Dict) -> float:
        """Calculate overall risk score from multiple signals"""
        risk_score = 0.0
        
        # Duplicate detection signal
        duplicate_score = signals.get('duplicate_score', 0.0)
        risk_score += self.weights['duplicate_score'] * duplicate_score
        
        # Anomaly detection signal
        anomaly_score = signals.get('anomaly_score', 0.0)
        risk_score += self.weights['anomaly_score'] * anomaly_score
        
        # Network centrality (fraud network involvement)
        network_score = signals.get('network_centrality', 0.0)
        risk_score += self.weights['network_centrality'] * network_score
        
        # Complaint severity
        complaint_score = signals.get('complaint_severity', 0.0)
        risk_score += self.weights['complaint_severity'] * complaint_score
        
        return round(np.clip(risk_score, 0, 1), 3)
    
    def categorize_risk(self, risk_score: float) -> str:
        """Categorize risk level"""
        if risk_score >= 0.8:
            return 'critical'
        elif risk_score >= 0.6:
            return 'high'
        elif risk_score >= 0.4:
            return 'medium'
        else:
            return 'low'
    
    def explain_risk(self, signals: Dict) -> List[Dict]:
        """Generate explanation for risk score"""
        risk_score = self.calculate_risk_score(signals)
        
        factors = []
        
        # Calculate contributions
        if signals.get('duplicate_score', 0) > 0:
            contribution = self.weights['duplicate_score'] * signals['duplicate_score']
            factors.append({
                'factor': 'duplicate_identity',
                'score': signals['duplicate_score'],
                'contribution': contribution,
                'percentage': (contribution / risk_score * 100) if risk_score > 0 else 0,
                'explanation': signals.get('duplicate_explanation', 'Potential duplicate identity detected')
            })
        
        if signals.get('anomaly_score', 0) > 0:
            contribution = self.weights['anomaly_score'] * signals['anomaly_score']
            factors.append({
                'factor': 'transaction_anomaly',
                'score': signals['anomaly_score'],
                'contribution': contribution,
                'percentage': (contribution / risk_score * 100) if risk_score > 0 else 0,
                'explanation': signals.get('anomaly_explanation', 'Unusual transaction pattern detected')
            })
        
        if signals.get('network_centrality', 0) > 0:
            contribution = self.weights['network_centrality'] * signals['network_centrality']
            factors.append({
                'factor': 'fraud_network',
                'score': signals['network_centrality'],
                'contribution': contribution,
                'percentage': (contribution / risk_score * 100) if risk_score > 0 else 0,
                'explanation': signals.get('network_explanation', 'Part of suspicious network')
            })
        
        if signals.get('complaint_severity', 0) > 0:
            contribution = self.weights['complaint_severity'] * signals['complaint_severity']
            factors.append({
                'factor': 'complaints',
                'score': signals['complaint_severity'],
                'contribution': contribution,
                'percentage': (contribution / risk_score * 100) if risk_score > 0 else 0,
                'explanation': signals.get('complaint_explanation', 'Complaints filed against beneficiary')
            })
        
        # Sort by contribution
        factors.sort(key=lambda x: x['contribution'], reverse=True)
        
        return factors
    
    def recommend_actions(self, risk_score: float, risk_category: str) -> List[str]:
        """Recommend actions based on risk level"""
        if risk_category == 'critical':
            return [
                'immediate_investigation',
                'freeze_payments',
                'field_verification',
                'escalate_to_vigilance'
            ]
        elif risk_category == 'high':
            return [
                'manual_verification',
                'field_investigation',
                'document_review'
            ]
        elif risk_category == 'medium':
            return [
                'monitoring_required',
                'periodic_review'
            ]
        else:
            return ['normal_processing']
    
    def assess_beneficiary(self, beneficiary: Dict, signals: Dict) -> Dict:
        """Complete risk assessment for a beneficiary"""
        risk_score = self.calculate_risk_score(signals)
        risk_category = self.categorize_risk(risk_score)
        factors = self.explain_risk(signals)
        actions = self.recommend_actions(risk_score, risk_category)
        
        return {
            'beneficiary_id': beneficiary.get('beneficiary_id'),
            'risk_score': risk_score,
            'risk_category': risk_category,
            'factors': factors,
            'recommended_actions': actions
        }

# Global instance
risk_scorer = RiskScorer()
