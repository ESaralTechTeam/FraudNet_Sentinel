from fuzzywuzzy import fuzz
import jellyfish
from datetime import datetime
from typing import Dict, List, Tuple

class DuplicateDetector:
    def __init__(self):
        self.threshold = 0.75
    
    def calculate_similarity(self, ben1: Dict, ben2: Dict) -> float:
        """Calculate similarity score between two beneficiaries"""
        scores = []
        
        # Name similarity (Levenshtein)
        name_score = fuzz.ratio(ben1['name'].lower(), ben2['name'].lower()) / 100.0
        scores.append(name_score * 0.35)
        
        # Phonetic similarity (Soundex)
        try:
            soundex1 = jellyfish.soundex(ben1['name'])
            soundex2 = jellyfish.soundex(ben2['name'])
            phonetic_score = 1.0 if soundex1 == soundex2 else 0.0
            scores.append(phonetic_score * 0.20)
        except:
            scores.append(0.0)
        
        # Date of birth proximity
        try:
            dob1 = datetime.strptime(ben1['date_of_birth'], '%Y-%m-%d')
            dob2 = datetime.strptime(ben2['date_of_birth'], '%Y-%m-%d')
            dob_diff = abs((dob1 - dob2).days)
            dob_score = 1.0 if dob_diff <= 1 else max(0, 1 - (dob_diff / 365))
            scores.append(dob_score * 0.15)
        except:
            scores.append(0.0)
        
        # Address similarity
        address_score = fuzz.token_set_ratio(
            ben1['address'].lower(), 
            ben2['address'].lower()
        ) / 100.0
        scores.append(address_score * 0.15)
        
        # Phone similarity
        phone_score = 1.0 if ben1['phone'] == ben2['phone'] else 0.0
        scores.append(phone_score * 0.10)
        
        # Bank account similarity
        bank_score = 1.0 if ben1['bank_account_hash'] == ben2['bank_account_hash'] else 0.0
        scores.append(bank_score * 0.05)
        
        total_score = sum(scores)
        return round(total_score, 3)
    
    def find_duplicates(self, beneficiaries: List[Dict]) -> List[Tuple[str, str, float]]:
        """Find potential duplicate beneficiaries"""
        duplicates = []
        
        for i in range(len(beneficiaries)):
            for j in range(i + 1, len(beneficiaries)):
                ben1 = beneficiaries[i]
                ben2 = beneficiaries[j]
                
                similarity = self.calculate_similarity(ben1, ben2)
                
                if similarity >= self.threshold:
                    duplicates.append((
                        ben1['beneficiary_id'],
                        ben2['beneficiary_id'],
                        similarity
                    ))
        
        return duplicates
    
    def check_duplicate(self, new_beneficiary: Dict, existing_beneficiaries: List[Dict]) -> Dict:
        """Check if new beneficiary is duplicate of existing ones"""
        best_match = None
        best_score = 0.0
        
        for existing in existing_beneficiaries:
            if existing['beneficiary_id'] == new_beneficiary.get('beneficiary_id'):
                continue
            
            similarity = self.calculate_similarity(new_beneficiary, existing)
            
            if similarity > best_score:
                best_score = similarity
                best_match = existing['beneficiary_id']
        
        is_duplicate = best_score >= self.threshold
        
        return {
            'is_duplicate': is_duplicate,
            'duplicate_score': best_score,
            'matched_beneficiary': best_match if is_duplicate else None,
            'explanation': f"High similarity ({best_score:.2f}) to {best_match}" if is_duplicate else "No duplicates found"
        }
