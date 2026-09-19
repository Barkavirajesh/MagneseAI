import os
import joblib
import pandas as pd
import numpy as np
from app.ml.feature_extractor import FEATURE_NAMES, build_feature_vector

class ManganesePredictor:
    def __init__(self, model_path: str = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        ensemble_path = os.path.join(base_dir, "data", "manganese_ensemble.pkl")
        fallback_path = os.path.join(base_dir, "data", "manganese_model.pkl")
        
        self.is_ensemble = False
        self.rf_classifier = None
        self.gb_classifier = None
        self.lr_classifier = None
        self.regressor = None
        self.kmeans = None
        self.benchmarks = {}
        self.cluster_labels = {
            0: "Gondite Supergene High-Grade Prospectivity Zone (Jamda-Koira / Balaghat Signature)",
            1: "Lateritic Manganese Surface Alteration Cap",
            2: "Sedimentary Carbonate Host Rock",
            3: "Non-Mineralized Surface / Vegetation Canopy"
        }
        self.jamda_koira_ref = [
            0.07, 0.09, 0.18, 0.20, 0.21, 0.22, 0.13, 0.14, 0.32, 0.25,
            0.28, -0.18, 0.12, 2.46, 0.78, 2.57, 1.28, 1.11, 1.05,
            450.0, 15.0, 180.0, 0.02, 25.0,
            1, 2, 1, 1.2, 2.2,
            0.18, 1, 0.8, 3.5, 1.2, 0.85
        ]
        
        if os.path.exists(ensemble_path):
            payload = joblib.load(ensemble_path)
            self.rf_classifier = payload.get("rf_classifier", payload.get("classifier"))
            self.gb_classifier = payload.get("gb_classifier", payload.get("classifier"))
            self.lr_classifier = payload.get("lr_classifier", None)
            self.regressor = payload.get("regressor", None)
            self.kmeans = payload.get("kmeans", None)
            self.benchmarks = payload.get("benchmarks", {})
            if "cluster_labels" in payload:
                self.cluster_labels = payload["cluster_labels"]
            if "jamda_koira_reference" in payload:
                self.jamda_koira_ref = payload["jamda_koira_reference"]
            self.is_ensemble = True
            print("Loaded Ensemble Multi-Model & K-Means Suite (Random Forest + Gradient Boosting + Logistic Regression + KMeans)")
        elif os.path.exists(fallback_path):
            self.rf_classifier = joblib.load(fallback_path)
            self.gb_classifier = self.rf_classifier
            self.regressor = None
            print("Loaded Fallback Model")
        else:
            raise FileNotFoundError("No trained model pickle found in data directory.")
            
        self.feature_names = FEATURE_NAMES
        
    def get_benchmarks(self) -> dict:
        return self.benchmarks

    def _calc_similarity_pct(self, vector: list) -> float:
        """Calculates cosine similarity percentage against Jamda-Koira deposit signature."""
        try:
            v_a = np.array(vector)
            v_b = np.array(self.jamda_koira_ref)
            norm_a = np.linalg.norm(v_a)
            norm_b = np.linalg.norm(v_b)
            if norm_a == 0 or norm_b == 0:
                return 50.0
            dot = np.dot(v_a, v_b)
            cos_sim = dot / (norm_a * norm_b)
            sim_pct = round(float(max(0.0, min(1.0, cos_sim))) * 100, 1)
            return sim_pct
        except Exception:
            return 75.0

    def predict_cell_probability(
        self,
        spectral: dict,
        terrain: dict,
        geology: dict,
        landcover: dict,
        hydrology: dict,
        dist_to_deposit_km: float,
        road_prox: float = 0.5,
        model_type: str = "rf"
    ) -> dict:
        """
        Runs model inference for a single spatial sub-zone cell.
        Parameters:
        - model_type: 'rf' (Random Forest), 'gbm' (Gradient Boosting / XGBoost), or 'lr' (Logistic Regression)
        Returns prospectivity score, estimated grade % Mn, K-Means cluster info, and confidence tier.
        """
        vector = build_feature_vector(
            spectral=spectral,
            terrain=terrain,
            geology=geology,
            landcover=landcover,
            hydrology=hydrology,
            dist_to_known_deposit_km=dist_to_deposit_km,
            road_proximity_score=road_prox
        )
        
        df = pd.DataFrame([vector], columns=self.feature_names)
        
        # Select classifier
        if model_type == "gbm" and self.gb_classifier is not None:
            clf = self.gb_classifier
            model_label = "Gradient Boosting (XGBoost)"
        elif model_type == "lr" and self.lr_classifier is not None:
            clf = self.lr_classifier
            model_label = "Logistic Regression Baseline"
        else:
            clf = self.rf_classifier
            model_label = "Random Forest Classifier"
            
        proba = float(clf.predict_proba(df)[0][1])
        
        # Estimate Ore Grade % Mn if regressor is present
        estimated_grade = 0.0
        if self.regressor is not None:
            estimated_grade = float(self.regressor.predict(df)[0])
            if proba < 0.25:
                estimated_grade = 0.0
            else:
                estimated_grade = max(18.0, min(52.0, estimated_grade))
        else:
            estimated_grade = round(30.0 + proba * 18.0, 1) if proba >= 0.3 else 0.0
            
        prob_pct = round(proba * 100, 1)
        
        if prob_pct >= 75.0:
            category = "High Prospectivity Zone (Candidate Exploration Area)"
            color_tier = "red"
        elif prob_pct >= 50.0:
            category = "Medium-High Prospectivity Zone"
            color_tier = "orange"
        elif prob_pct >= 30.0:
            category = "Medium Prospectivity Zone"
            color_tier = "yellow"
        else:
            category = "Low Prospectivity Zone"
            color_tier = "green"
            
        # K-Means Cluster & Similarity
        cluster_id = 0
        cluster_label = "Unclassified"
        if self.kmeans is not None:
            cluster_id = int(self.kmeans.predict(df)[0])
            cluster_label = self.cluster_labels.get(cluster_id, "Mineral Prospectivity Cluster")
            
        jamda_koira_sim = self._calc_similarity_pct(vector)
            
        return {
            "model_used": model_label,
            "probability_percent": prob_pct,
            "probability_raw": round(proba, 4),
            "estimated_grade_mn_pct": round(estimated_grade, 1),
            "category": category,
            "color_tier": color_tier,
            "cluster_id": cluster_id,
            "cluster_label": cluster_label,
            "jamda_koira_similarity_pct": jamda_koira_sim,
            "feature_vector": dict(zip(self.feature_names, vector))
        }

predictor_instance = None

def get_predictor():
    global predictor_instance
    if predictor_instance is None:
        predictor_instance = ManganesePredictor()
    return predictor_instance

