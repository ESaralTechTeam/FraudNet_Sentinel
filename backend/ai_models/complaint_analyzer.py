import re
from typing import Dict, List

class ComplaintAnalyzer:
    def __init__(self):
        # Urgency keywords
        self.urgency_keywords = {
            'high': ['urgent', 'immediate', 'emergency', 'critical', 'serious', 'fraud', 'fake', 'ghost'],
            'medium': ['suspicious', 'concern', 'issue', 'problem', 'wrong', 'incorrect'],
            'low': ['query', 'question', 'information', 'clarification']
        }
        
        # Sentiment keywords
        self.negative_keywords = ['fraud', 'fake', 'cheat', 'corrupt', 'bribe', 'illegal', 'wrong', 'false']
        self.positive_keywords = ['genuine', 'correct', 'proper', 'legitimate']
        
        # Complaint type keywords
        self.type_keywords = {
            'duplicate': ['duplicate', 'same person', 'multiple', 'twice', 'already'],
            'ghost': ['ghost', 'fake', 'not exist', 'dead', 'deceased'],
            'fraud': ['fraud', 'cheat', 'scam', 'illegal'],
            'bribery': ['bribe', 'money', 'pay', 'demand', 'corrupt']
        }
    
    def analyze_urgency(self, text: str) -> float:
        """Analyze urgency of complaint (0-1)"""
        text_lower = text.lower()
        
        high_count = sum(1 for word in self.urgency_keywords['high'] if word in text_lower)
        medium_count = sum(1 for word in self.urgency_keywords['medium'] if word in text_lower)
        low_count = sum(1 for word in self.urgency_keywords['low'] if word in text_lower)
        
        if high_count > 0:
            urgency = 0.8 + (high_count * 0.05)
        elif medium_count > 0:
            urgency = 0.5 + (medium_count * 0.05)
        elif low_count > 0:
            urgency = 0.2
        else:
            urgency = 0.4  # Default
        
        return min(urgency, 1.0)
    
    def analyze_sentiment(self, text: str) -> float:
        """Analyze sentiment (-1 to 1, negative to positive)"""
        text_lower = text.lower()
        
        negative_count = sum(1 for word in self.negative_keywords if word in text_lower)
        positive_count = sum(1 for word in self.positive_keywords if word in text_lower)
        
        sentiment = (positive_count - negative_count) / max(positive_count + negative_count, 1)
        
        return round(sentiment, 2)
    
    def classify_type(self, text: str) -> str:
        """Classify complaint type"""
        text_lower = text.lower()
        
        scores = {}
        for complaint_type, keywords in self.type_keywords.items():
            score = sum(1 for word in keywords if word in text_lower)
            scores[complaint_type] = score
        
        if max(scores.values()) > 0:
            return max(scores, key=scores.get)
        else:
            return 'general'
    
    def extract_beneficiary_id(self, text: str) -> str:
        """Extract beneficiary ID from text"""
        # Look for patterns like BEN123456
        pattern = r'BEN\d{3,}'
        match = re.search(pattern, text.upper())
        return match.group(0) if match else None
    
    def analyze(self, complaint_text: str) -> Dict:
        """Complete complaint analysis"""
        urgency_score = self.analyze_urgency(complaint_text)
        sentiment_score = self.analyze_sentiment(complaint_text)
        complaint_type = self.classify_type(complaint_text)
        beneficiary_id = self.extract_beneficiary_id(complaint_text)
        
        return {
            'urgency_score': urgency_score,
            'sentiment_score': sentiment_score,
            'predicted_type': complaint_type,
            'extracted_beneficiary_id': beneficiary_id,
            'keywords_found': self._extract_keywords(complaint_text)
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords from text"""
        text_lower = text.lower()
        keywords = []
        
        all_keywords = (
            self.urgency_keywords['high'] + 
            self.negative_keywords + 
            sum(self.type_keywords.values(), [])
        )
        
        for keyword in set(all_keywords):
            if keyword in text_lower:
                keywords.append(keyword)
        
        return keywords[:5]  # Return top 5

# Global instance
complaint_analyzer = ComplaintAnalyzer()
