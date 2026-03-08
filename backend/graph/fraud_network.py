from typing import Dict, List, Set, Tuple
from collections import defaultdict
import networkx as nx

class FraudNetworkDetector:
    """Simulates Neptune graph database for fraud network detection"""
    
    def __init__(self):
        self.graph = nx.Graph()
        self.beneficiary_nodes = {}
        self.resource_nodes = {}
    
    def add_beneficiary(self, beneficiary: Dict):
        """Add beneficiary node to graph"""
        ben_id = beneficiary['beneficiary_id']
        self.graph.add_node(ben_id, 
                           node_type='beneficiary',
                           name=beneficiary['name'],
                           district=beneficiary['district'],
                           risk_score=beneficiary.get('risk_score', 0))
        self.beneficiary_nodes[ben_id] = beneficiary
    
    def add_shared_resource(self, beneficiary_id: str, resource_type: str, resource_id: str):
        """Add edge for shared resource (bank account, address, phone)"""
        resource_node = f"{resource_type}:{resource_id}"
        
        if resource_node not in self.graph:
            self.graph.add_node(resource_node, node_type=resource_type)
            self.resource_nodes[resource_node] = {'type': resource_type, 'id': resource_id}
        
        self.graph.add_edge(beneficiary_id, resource_node, 
                           relationship='SHARES_' + resource_type.upper())
    
    def build_graph(self, beneficiaries: List[Dict]):
        """Build fraud network graph from beneficiaries"""
        self.graph.clear()
        self.beneficiary_nodes.clear()
        self.resource_nodes.clear()
        
        for ben in beneficiaries:
            self.add_beneficiary(ben)
            
            # Add shared resources
            self.add_shared_resource(ben['beneficiary_id'], 'bank', ben['bank_account_hash'])
            self.add_shared_resource(ben['beneficiary_id'], 'address', ben['address'][:20])
            self.add_shared_resource(ben['beneficiary_id'], 'phone', ben['phone'])
    
    def find_shared_resources(self, min_connections: int = 2) -> List[Dict]:
        """Find resources shared by multiple beneficiaries (hub pattern)"""
        networks = []
        
        for node in self.graph.nodes():
            if self.graph.nodes[node].get('node_type') in ['bank', 'address', 'phone']:
                # Get all beneficiaries connected to this resource
                connected_beneficiaries = [
                    n for n in self.graph.neighbors(node)
                    if self.graph.nodes[n].get('node_type') == 'beneficiary'
                ]
                
                if len(connected_beneficiaries) >= min_connections:
                    total_amount = sum(
                        self.beneficiary_nodes[ben_id].get('amount', 0)
                        for ben_id in connected_beneficiaries
                    )
                    
                    avg_risk = sum(
                        self.beneficiary_nodes[ben_id].get('risk_score', 0)
                        for ben_id in connected_beneficiaries
                    ) / len(connected_beneficiaries)
                    
                    networks.append({
                        'pattern': 'hub',
                        'shared_resource': node,
                        'resource_type': self.graph.nodes[node]['node_type'],
                        'beneficiary_ids': connected_beneficiaries,
                        'size': len(connected_beneficiaries),
                        'total_amount': total_amount,
                        'risk_score': min(avg_risk * 1.5, 1.0)  # Amplify risk for networks
                    })
        
        return sorted(networks, key=lambda x: x['risk_score'], reverse=True)
    
    def find_connected_components(self) -> List[List[str]]:
        """Find connected clusters of beneficiaries"""
        # Get subgraph with only beneficiary nodes
        beneficiary_subgraph = self.graph.subgraph([
            n for n in self.graph.nodes()
            if self.graph.nodes[n].get('node_type') == 'beneficiary'
        ])
        
        components = list(nx.connected_components(self.graph))
        
        # Filter to only components with multiple beneficiaries
        result = []
        for component in components:
            beneficiaries = [
                n for n in component
                if self.graph.nodes[n].get('node_type') == 'beneficiary'
            ]
            if len(beneficiaries) >= 2:
                result.append(beneficiaries)
        
        return result
    
    def calculate_centrality(self, beneficiary_id: str) -> float:
        """Calculate network centrality for a beneficiary"""
        if beneficiary_id not in self.graph:
            return 0.0
        
        # Degree centrality (normalized)
        degree = self.graph.degree(beneficiary_id)
        max_degree = max(dict(self.graph.degree()).values()) if self.graph.number_of_nodes() > 0 else 1
        
        centrality = degree / max_degree if max_degree > 0 else 0
        
        return round(centrality, 3)
    
    def get_network_for_beneficiary(self, beneficiary_id: str, depth: int = 2) -> Dict:
        """Get fraud network around a specific beneficiary"""
        if beneficiary_id not in self.graph:
            return {'nodes': [], 'edges': []}
        
        # BFS to get nodes within depth
        visited = set()
        queue = [(beneficiary_id, 0)]
        nodes = []
        edges = []
        
        while queue:
            node, current_depth = queue.pop(0)
            
            if node in visited or current_depth > depth:
                continue
            
            visited.add(node)
            
            # Add node
            node_data = {
                'id': node,
                'type': self.graph.nodes[node].get('node_type', 'unknown'),
                'label': node
            }
            
            if node_data['type'] == 'beneficiary':
                node_data['risk_score'] = self.graph.nodes[node].get('risk_score', 0)
                node_data['name'] = self.graph.nodes[node].get('name', '')
            
            nodes.append(node_data)
            
            # Add neighbors
            for neighbor in self.graph.neighbors(node):
                if neighbor not in visited:
                    queue.append((neighbor, current_depth + 1))
                
                # Add edge
                if neighbor in visited or current_depth < depth:
                    edges.append({
                        'source': node,
                        'target': neighbor,
                        'type': 'connected'
                    })
        
        return {
            'nodes': nodes,
            'edges': edges,
            'statistics': {
                'total_nodes': len(nodes),
                'total_edges': len(edges),
                'beneficiary_count': sum(1 for n in nodes if n['type'] == 'beneficiary')
            }
        }
    
    def detect_all_fraud_patterns(self) -> Dict:
        """Detect all fraud patterns in the network"""
        return {
            'shared_resources': self.find_shared_resources(min_connections=2),
            'connected_clusters': self.find_connected_components(),
            'high_centrality_nodes': self._find_high_centrality_nodes()
        }
    
    def _find_high_centrality_nodes(self, threshold: float = 0.5) -> List[Dict]:
        """Find beneficiaries with high network centrality"""
        high_centrality = []
        
        for ben_id in self.beneficiary_nodes.keys():
            centrality = self.calculate_centrality(ben_id)
            if centrality >= threshold:
                high_centrality.append({
                    'beneficiary_id': ben_id,
                    'centrality': centrality,
                    'connections': self.graph.degree(ben_id)
                })
        
        return sorted(high_centrality, key=lambda x: x['centrality'], reverse=True)

# Global instance
fraud_network_detector = FraudNetworkDetector()
