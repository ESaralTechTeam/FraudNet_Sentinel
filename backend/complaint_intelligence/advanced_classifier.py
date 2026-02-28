"""
Advanced Complaint Intelligence
Enhanced classification, clustering, and linking
"""

from typing import Dict, List, Tuple
import re
from collections import Counter
from datetime import datetime

class AdvancedComplaintClassifier:
    """Enhanced complaint classification with severity and corruption detection"""
    
    def __init__(self):
        # Corruption keywords by severity
        self.corruption_keywords = {
            'critical': ['bribe', 'extortion', 'blackmail', 'threat', 'demand money'],
            'high': ['corrupt', 'illegal', 'fraud', 'fake', 'ghost', 'cheat'],
            'medium': ['suspicious', 'irregular', 'improper', 'unauthorized'],
            'low': ['delay', 'slow', 'confusion', 'mistake']
        }
        
        # Urgency indicators
        self.urgency_indicators = {
            'immediate': ['urgent', 'emergency', 'critical', 'immediate', 'asap'],
            'high': ['soon', 'quickly', 'fast', 'priority'],
            'normal': ['when possible', 'eventually', 'sometime']
        }
        
        # Beneficiary ID patterns
        self.ben_id_pattern = r'BEN\d{3,}'
    
    def classify_complaint(self, complaint: Dict) -> Dict:
        """Comprehensive complaint classification"""
        description = complaint.get('description', '').lower()
        
        # Detect corruption
        corruption_analysis = self._detect_corruption(description)
        
        # Classify urgency
        urgency_analysis = self._classify_urgency(description)
        
        # Detect severity
        severity = self._calculate_severity(corruption_analysis, urgency_analysis)
        
        # Extract entities
        entities = self._extract_entities(complaint.get('description', ''))
        
        # Auto-link to beneficiaries
        linked_beneficiaries = self._extract_beneficiary_ids(complaint.get('description', ''))
        
        return {
            'complaint_id': complaint.get('complaint_id'),
            'corruption_detected': corruption_analysis['detected'],
            'corruption_level': corruption_analysis['level'],
            'corruption_keywords': corruption_analysis['keywords'],
            'urgency_level': urgency_analysis['level'],
            'urgency_score': urgency_analysis['score'],
            'severity': severity,
            'entities': entities,
            'linked_beneficiaries': linked_beneficiaries,
            'requires_immediate_action': severity in ['critical', 'high'],
            'classification_confidence': self._calculate_confidence(corruption_analysis, urgency_analysis)
        }
    
    def _detect_corruption(self, text: str) -> Dict:
        """Detect corruption indicators"""
        detected_keywords = []
        highest_level = 'none'
        
        for level in ['critical', 'high', 'medium', 'low']:
            for keyword in self.corruption_keywords[level]:
                if keyword in text:
                    detected_keywords.append(keyword)
                    if highest_level == 'none':
                        highest_level = level
        
        return {
            'detected': len(detected_keywords) > 0,
            'level': highest_level,
            'keywords': detected_keywords,
            'count': len(detected_keywords)
        }
    
    def _classify_urgency(self, text: str) -> Dict:
        """Classify urgency level"""
        urgency_level = 'normal'
        urgency_score = 0.5
        
        for level, keywords in self.urgency_indicators.items():
            for keyword in keywords:
                if keyword in text:
                    if level == 'immediate':
                        urgency_level = 'immediate'
                        urgency_score = 0.95
                        break
                    elif level == 'high' and urgency_level == 'normal':
                        urgency_level = 'high'
                        urgency_score = 0.75
        
        # Boost urgency if corruption detected
        if any(word in text for word in self.corruption_keywords['critical']):
            urgency_score = min(urgency_score + 0.2, 1.0)
        
        return {
            'level': urgency_level,
            'score': urgency_score
        }
    
    def _calculate_severity(self, corruption: Dict, urgency: Dict) -> str:
        """Calculate overall severity"""
        if corruption['level'] == 'critical' or urgency['level'] == 'immediate':
            return 'critical'
        elif corruption['level'] == 'high' or urgency['level'] == 'high':
            return 'high'
        elif corruption['level'] == 'medium':
            return 'medium'
        else:
            return 'low'
    
    def _extract_entities(self, text: str) -> Dict:
        """Extract named entities from complaint"""
        entities = {
            'beneficiary_ids': [],
            'officer_names': [],
            'locations': [],
            'amounts': []
        }
        
        # Extract beneficiary IDs
        entities['beneficiary_ids'] = re.findall(self.ben_id_pattern, text.upper())
        
        # Extract amounts (₹ or Rs.)
        amount_patterns = [
            r'₹\s*[\d,]+',
            r'Rs\.?\s*[\d,]+',
            r'rupees?\s*[\d,]+'
        ]
        for pattern in amount_patterns:
            entities['amounts'].extend(re.findall(pattern, text, re.IGNORECASE))
        
        return entities
    
    def _extract_beneficiary_ids(self, text: str) -> List[str]:
        """Extract beneficiary IDs for auto-linking"""
        return re.findall(self.ben_id_pattern, text.upper())
    
    def _calculate_confidence(self, corruption: Dict, urgency: Dict) -> float:
        """Calculate classification confidence"""
        confidence = 0.7  # Base confidence
        
        # Increase confidence if clear indicators found
        if corruption['count'] > 2:
            confidence += 0.15
        if urgency['score'] > 0.8:
            confidence += 0.1
        
        return min(confidence, 0.95)

class ComplaintClusterer:
    """Cluster similar complaints for pattern detection"""
    
    def __init__(self):
        self.similarity_threshold = 0.6
    
    def cluster_complaints(self, complaints: List[Dict]) -> List[Dict]:
        """Cluster complaints by similarity"""
        clusters = []
        processed = set()
        
        for i, complaint1 in enumerate(complaints):
            if i in processed:
                continue
            
            cluster = {
                'cluster_id': f"CLU{i+1:03d}",
                'complaints': [complaint1['complaint_id']],
                'common_theme': self._extract_theme(complaint1),
                'severity': complaint1.get('severity', 'medium'),
                'count': 1
            }
            
            # Find similar complaints
            for j, complaint2 in enumerate(complaints[i+1:], start=i+1):
                if j in processed:
                    continue
                
                similarity = self._calculate_similarity(complaint1, complaint2)
                if similarity >= self.similarity_threshold:
                    cluster['complaints'].append(complaint2['complaint_id'])
                    cluster['count'] += 1
                    processed.add(j)
            
            if cluster['count'] > 1:  # Only include clusters with multiple complaints
                clusters.append(cluster)
            
            processed.add(i)
        
        return sorted(clusters, key=lambda x: x['count'], reverse=True)
    
    def _calculate_similarity(self, complaint1: Dict, complaint2: Dict) -> float:
        """Calculate similarity between complaints"""
        score = 0.0
        
        # Same type
        if complaint1.get('complaint_type') == complaint2.get('complaint_type'):
            score += 0.3
        
        # Same district
        loc1 = complaint1.get('location', {})
        loc2 = complaint2.get('location', {})
        if loc1.get('district') == loc2.get('district'):
            score += 0.2
        
        # Similar keywords
        desc1 = set(complaint1.get('description', '').lower().split())
        desc2 = set(complaint2.get('description', '').lower().split())
        keyword_overlap = len(desc1 & desc2) / max(len(desc1 | desc2), 1)
        score += keyword_overlap * 0.3
        
        # Similar severity
        if complaint1.get('severity') == complaint2.get('severity'):
            score += 0.2
        
        return score
    
    def _extract_theme(self, complaint: Dict) -> str:
        """Extract common theme from complaint"""
        complaint_type = complaint.get('complaint_type', 'general')
        return complaint_type.replace('_', ' ').title()

class ComplaintSummarizer:
    """Generate summaries for complaints"""
    
    def summarize_for_officer(self, complaint: Dict, classification: Dict) -> str:
        """Generate officer-friendly summary"""
        summary_parts = []
        
        # Header
        summary_parts.append(f"COMPLAINT #{complaint.get('complaint_id')}")
        summary_parts.append(f"Severity: {classification.get('severity', 'medium').upper()}")
        
        # Key details
        if classification.get('corruption_detected'):
            summary_parts.append(f"⚠️ CORRUPTION INDICATORS: {', '.join(classification.get('corruption_keywords', []))}")
        
        if classification.get('urgency_level') in ['immediate', 'high']:
            summary_parts.append(f"🚨 URGENCY: {classification.get('urgency_level').upper()}")
        
        # Description (truncated)
        desc = complaint.get('description', '')
        if len(desc) > 150:
            desc = desc[:150] + "..."
        summary_parts.append(f"\nDescription: {desc}")
        
        # Linked entities
        if classification.get('linked_beneficiaries'):
            summary_parts.append(f"\nLinked Beneficiaries: {', '.join(classification['linked_beneficiaries'])}")
        
        # Recommended action
        if classification.get('requires_immediate_action'):
            summary_parts.append("\n✓ IMMEDIATE ACTION REQUIRED")
        
        return "\n".join(summary_parts)
    
    def summarize_cluster(self, cluster: Dict, complaints: List[Dict]) -> str:
        """Summarize a cluster of complaints"""
        summary = f"COMPLAINT CLUSTER: {cluster['cluster_id']}\n"
        summary += f"Theme: {cluster['common_theme']}\n"
        summary += f"Count: {cluster['count']} similar complaints\n"
        summary += f"Severity: {cluster['severity'].upper()}\n\n"
        summary += "This cluster indicates a potential systemic issue requiring investigation."
        
        return summary

# Global instances
advanced_classifier = AdvancedComplaintClassifier()
complaint_clusterer = ComplaintClusterer()
complaint_summarizer = ComplaintSummarizer()
