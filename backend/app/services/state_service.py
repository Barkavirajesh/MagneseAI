import os
import json
from typing import List, Dict

class StateService:
    def __init__(self, json_path: str = None):
        if json_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            json_path = os.path.join(base_dir, "data", "india_states_districts.json")
        self.json_path = json_path
        self._load_data()

    def _load_data(self):
        if os.path.exists(self.json_path):
            with open(self.json_path, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        else:
            self.data = {"states": []}
            
    def get_all_states(self) -> List[Dict]:
        """Returns list of all Indian states with reserve rank and district counts."""
        self._load_data()
        states_summary = []
        for s in self.data.get("states", []):
            states_summary.append({
                "id": s["id"],
                "name": s["name"],
                "capital": s.get("capital", ""),
                "manganese_reserve_rank": s.get("manganese_reserve_rank", 99),
                "national_share_pct": s.get("national_share_pct", 0.0),
                "center": s.get("center", {}),
                "bbox": s.get("bbox", {}),
                "district_count": len(s.get("districts", []))
            })
        return states_summary

    def get_state_by_id(self, state_id: str) -> Dict:
        """Finds state by ID (e.g., 'odisha', 'madhya_pradesh', 'maharashtra', 'karnataka', 'tamil_nadu')."""
        self._load_data()
        for s in self.data.get("states", []):
            if s["id"] == state_id:
                return s
        return None

def get_state_service():
    return StateService()
