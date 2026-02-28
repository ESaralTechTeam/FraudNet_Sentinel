"""
Semantic Search Engine
Embeddings-based similarity search across complaints, beneficiaries, and cases
"""

from typing import List, Dict, Tuple
import numpy as np
from collections import defaultdict
import re

class SimpleEmbedder:
    """Simple TF-IDF style embedder for demo (can be replaced with sentence-transformers)"""
    
    def __init__(self):
        self.vocabulary = {}
        self.idf = {}
        self.documents = []
    
    def fit(self, documents: List[str]):
        """Build vocabulary and IDF from documents"""
        self.documents = documents
        
        # Build vocabulary
        word_doc_count = defaultdict(int)
        for doc in documents:
            words = set(self._tokenize(doc))
            for word in words:
                word_doc_count[word] += 1
        
        # Assign indices and calculate IDF
        for idx, (word, doc_count) in enumerate(word_doc_count.items()):
            self.vocabulary[word] = idx
            self.idf[word] = np.log(len(documents) / (doc_count + 1))
    
    def embed(self, text: str) -> np.ndarray:
        """Convert text to embedding vector"""
        words = self._tokenize(text)
        vector = np.zeros(len(self.vocabulary))
        
        # Count word frequencies
        word_counts = defaultdict(int)
        for word in words:
            if word in self.vocabulary:
                word_counts[word] += 1
        
        # Calculate TF-IDF
        for word, count in word_counts.items():
            if word in self.vocabulary:
                idx = self.vocabulary[word]
                tf = count / len(words) if words else 0
                vector[idx] = tf * self.idf.get(word, 0)
        
        # Normalize
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        
        return vector
    
    def _tokenize(self, text: str) -> List[str]:
        """Simple tokenization"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        return [w for w in text.split() if len(w) > 2]

class SemanticSearchEngine:
    """Semantic search across multiple data types"""
    
    def __init__(self):
        self.embedder = SimpleEmbedder()
        self.complaint_embeddings = {}
        self.beneficiary_embeddings = {}
        self.case_embeddings = {}
        self.is_fitted = False
    
    def index_complaints(self, complaints: List[Dict]):
        """Index complaints for semantic search"""
        documents = []
        complaint_ids = []
        
        for complaint in complaints:
            text = self._complaint_to_text(complaint)
            documents.append(text)
            complaint_ids.append(complaint['complaint_id'])
        
        if not self.is_fitted:
            self.embedder.fit(documents)
            self.is_fitted = True
        
        for complaint_id, doc in zip(complaint_ids, documents):
            self.complaint_embeddings[complaint_id] = self.embedder.embed(doc)
    
    def index_beneficiaries(self, beneficiaries: List[Dict]):
        """Index beneficiaries for semantic search"""
        for beneficiary in beneficiaries:
            text = self._beneficiary_to_text(beneficiary)
            ben_id = beneficiary['beneficiary_id']
            self.beneficiary_embeddings[ben_id] = self.embedder.embed(text)
    
    def index_cases(self, cases: List[Dict]):
        """Index cases for semantic search"""
        for case in cases:
            text = self._case_to_text(case)
            case_id = case['case_id']
            self.case_embeddings[case_id] = self.embedder.embed(text)
    
    def search_complaints(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search complaints using natural language"""
        query_embedding = self.embedder.embed(query)
        
        results = []
        for complaint_id, embedding in self.complaint_embeddings.items():
            similarity = self._cosine_similarity(query_embedding, embedding)
            results.append({
                'complaint_id': complaint_id,
                'similarity': float(similarity),
                'type': 'complaint'
            })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def search_beneficiaries(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search beneficiaries using natural language"""
        query_embedding = self.embedder.embed(query)
        
        results = []
        for ben_id, embedding in self.beneficiary_embeddings.items():
            similarity = self._cosine_similarity(query_embedding, embedding)
            results.append({
                'beneficiary_id': ben_id,
                'similarity': float(similarity),
                'type': 'beneficiary'
            })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def search_all(self, query: str, top_k: int = 10) -> List[Dict]:
        """Search across all indexed data"""
        query_embedding = self.embedder.embed(query)
        
        results = []
        
        # Search complaints
        for complaint_id, embedding in self.complaint_embeddings.items():
            similarity = self._cosine_similarity(query_embedding, embedding)
            results.append({
                'id': complaint_id,
                'similarity': float(similarity),
                'type': 'complaint'
            })
        
        # Search beneficiaries
        for ben_id, embedding in self.beneficiary_embeddings.items():
            similarity = self._cosine_similarity(query_embedding, embedding)
            results.append({
                'id': ben_id,
                'similarity': float(similarity),
                'type': 'beneficiary'
            })
        
        # Search cases
        for case_id, embedding in self.case_embeddings.items():
            similarity = self._cosine_similarity(query_embedding, embedding)
            results.append({
                'id': case_id,
                'similarity': float(similarity),
                'type': 'case'
            })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def find_similar_complaints(self, complaint_id: str, top_k: int = 5) -> List[Dict]:
        """Find complaints similar to a given complaint"""
        if complaint_id not in self.complaint_embeddings:
            return []
        
        query_embedding = self.complaint_embeddings[complaint_id]
        
        results = []
        for cid, embedding in self.complaint_embeddings.items():
            if cid == complaint_id:
                continue
            similarity = self._cosine_similarity(query_embedding, embedding)
            results.append({
                'complaint_id': cid,
                'similarity': float(similarity)
            })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def find_related_cases(self, beneficiary_id: str, top_k: int = 5) -> List[Dict]:
        """Find cases related to a beneficiary"""
        if beneficiary_id not in self.beneficiary_embeddings:
            return []
        
        query_embedding = self.beneficiary_embeddings[beneficiary_id]
        
        results = []
        for case_id, embedding in self.case_embeddings.items():
            similarity = self._cosine_similarity(query_embedding, embedding)
            results.append({
                'case_id': case_id,
                'similarity': float(similarity)
            })
        
        results.sort(key=lambda x: x['similarity'], reverse=True)
        return results[:top_k]
    
    def _complaint_to_text(self, complaint: Dict) -> str:
        """Convert complaint to searchable text"""
        parts = [
            complaint.get('complaint_type', ''),
            complaint.get('description', ''),
            complaint.get('location', {}).get('district', ''),
            complaint.get('status', '')
        ]
        return ' '.join(str(p) for p in parts if p)
    
    def _beneficiary_to_text(self, beneficiary: Dict) -> str:
        """Convert beneficiary to searchable text"""
        parts = [
            beneficiary.get('name', ''),
            beneficiary.get('district', ''),
            beneficiary.get('scheme', ''),
            beneficiary.get('address', ''),
            f"risk_{beneficiary.get('risk_category', 'low')}"
        ]
        return ' '.join(str(p) for p in parts if p)
    
    def _case_to_text(self, case: Dict) -> str:
        """Convert case to searchable text"""
        parts = [
            case.get('case_type', ''),
            case.get('title', ''),
            case.get('description', ''),
            case.get('status', '')
        ]
        return ' '.join(str(p) for p in parts if p)
    
    def _cosine_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity"""
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        return dot_product / (norm1 * norm2)

class KnowledgeEngine:
    """Knowledge discovery and pattern detection"""
    
    def __init__(self):
        self.search_engine = SemanticSearchEngine()
    
    def discover_patterns(self, query: str, data: Dict) -> Dict:
        """Discover patterns related to query"""
        # Search across all data
        results = self.search_engine.search_all(query, top_k=20)
        
        # Group by type
        patterns = defaultdict(list)
        for result in results:
            if result['similarity'] > 0.3:  # Threshold
                patterns[result['type']].append(result)
        
        return {
            'query': query,
            'patterns_found': len(results),
            'by_type': {
                'complaints': len(patterns['complaint']),
                'beneficiaries': len(patterns['beneficiary']),
                'cases': len(patterns['case'])
            },
            'top_matches': results[:5],
            'insights': self._generate_insights(patterns)
        }
    
    def suggest_related_cases(self, entity_id: str, entity_type: str) -> List[Dict]:
        """Suggest related cases for investigation"""
        if entity_type == 'complaint':
            return self.search_engine.find_similar_complaints(entity_id)
        elif entity_type == 'beneficiary':
            return self.search_engine.find_related_cases(entity_id)
        else:
            return []
    
    def _generate_insights(self, patterns: Dict) -> List[str]:
        """Generate insights from patterns"""
        insights = []
        
        if len(patterns['complaint']) > 5:
            insights.append(f"Found {len(patterns['complaint'])} related complaints - possible systemic issue")
        
        if len(patterns['beneficiary']) > 3:
            insights.append(f"Multiple beneficiaries match criteria - investigate for fraud network")
        
        if len(patterns['case']) > 2:
            insights.append(f"Similar cases exist - review for common patterns")
        
        return insights

# Global instances
semantic_search = SemanticSearchEngine()
knowledge_engine = KnowledgeEngine()
