import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.cluster import KMeans
from sklearn.model_selection import GroupKFold
from sklearn.metrics import (
    roc_auc_score,
    precision_recall_curve,
    auc,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    mean_squared_error
)

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from app.ml.feature_extractor import FEATURE_NAMES

def generate_spatial_dataset(num_samples: int = 2000):
    """
    Generates a 35-feature spatial dataset across 10 distinct geographic mining clusters in India.
    Prevents spatial data leakage by embedding spatial cluster IDs for Spatial GroupKFold validation.
    """
    np.random.seed(42)
    
    clusters = [
        {"id": 0, "name": "Jamda-Koira & Keonjhar Belt (Odisha)", "lat": 22.0, "lng": 85.35},
        {"id": 1, "name": "Bharweli & Balaghat Ore Field (Madhya Pradesh)", "lat": 21.8, "lng": 80.20},
        {"id": 2, "name": "Dongri-Buzurg & Nagpur Belt (Maharashtra)", "lat": 21.55, "lng": 79.65},
        {"id": 3, "name": "Sandur-Bellary Manganese Belt (Karnataka)", "lat": 15.10, "lng": 76.55},
        {"id": 4, "name": "Vizianagaram & Srikakulam Belt (Andhra Pradesh)", "lat": 18.25, "lng": 83.40},
        {"id": 5, "name": "Jhabua Belt (Madhya Pradesh)", "lat": 22.75, "lng": 74.60},
        {"id": 6, "name": "Shimoga Belt (Karnataka)", "lat": 13.90, "lng": 75.55},
        {"id": 7, "name": "Champaner Belt (Gujarat)", "lat": 22.45, "lng": 73.60},
        {"id": 8, "name": "Koraput Belt (Odisha)", "lat": 18.80, "lng": 82.70},
        {"id": 9, "name": "North Goa Manganese Ore Belt (Goa)", "lat": 15.55, "lng": 73.95},
    ]
    
    samples_per_cluster = num_samples // len(clusters)
    
    X_rows = []
    y_class = []
    y_grade = []
    cluster_ids = []
    
    for c in clusters:
        cid = c["id"]
        c_lat = c["lat"]
        c_lng = c["lng"]
        
        # 50% Positives (Mineral Prospectivity Zone), 50% Negatives (Barren/Forest/Water)
        for i in range(samples_per_cluster):
            is_positive = (i % 2 == 0)
            
            if is_positive:
                # High SWIR1, High Ferric Red, Alteration signature, close to fault/deposit
                dist_deposit = np.random.exponential(scale=3.5)
                fault_dist = np.random.uniform(0.2, 5.5)
                lineament_dens = np.random.uniform(0.8, 2.8)
                
                b02 = np.random.normal(0.07, 0.02)
                b03 = np.random.normal(0.09, 0.02)
                b04 = np.random.normal(0.16, 0.04)
                b05 = np.random.normal(0.18, 0.035)
                b06 = np.random.normal(0.19, 0.035)
                b07 = np.random.normal(0.20, 0.035)
                b08 = np.random.normal(0.15, 0.04) # Occasional vegetation overlap
                b8a = np.random.normal(0.16, 0.04)
                b11 = np.random.normal(0.29, 0.05) # SWIR1 alteration peak
                b12 = np.random.normal(0.23, 0.04) # SWIR2 peak
                
                elevation = np.random.uniform(150, 900)
                slope = np.random.uniform(3, 32)
                aspect = np.random.uniform(0, 360)
                curvature = np.random.normal(0.02, 0.06)
                ruggedness = np.random.uniform(8, 50)
                
                litho_code = np.random.choice([1, 2, 3, 4, 5, 6], p=[0.35, 0.25, 0.20, 0.10, 0.05, 0.05])
                rock_type = 2
                geo_age = np.random.choice([1, 2])
                
                bsi = np.random.normal(0.15, 0.06)
                lc_code = 1
                
                drain_dens = np.random.uniform(0.3, 1.3)
                dist_water = np.random.uniform(0.5, 10.0)
                road_prox = np.random.uniform(0.3, 0.9)
                
                label = 1
                grade = min(54.0, max(20.0, 18.0 + 8.5 * (b11 / (b08 + 1e-6) - 1.0) + max(0.0, 14.0 - dist_deposit) + np.random.normal(0, 2.5)))
            else:
                # Negative Background Controls (Plains, Forest, Basalt, Sedimentary)
                dist_deposit = np.random.uniform(10.0, 90.0)
                fault_dist = np.random.uniform(2.0, 30.0)
                lineament_dens = np.random.uniform(0.1, 1.2)
                
                is_forest = np.random.rand() > 0.4
                if is_forest:
                    b02 = np.random.normal(0.04, 0.015)
                    b03 = np.random.normal(0.07, 0.02)
                    b04 = np.random.normal(0.05, 0.015)
                    b05 = np.random.normal(0.13, 0.025)
                    b06 = np.random.normal(0.26, 0.04)
                    b07 = np.random.normal(0.36, 0.05)
                    b08 = np.random.normal(0.42, 0.06)
                    b8a = np.random.normal(0.43, 0.06)
                    b11 = np.random.normal(0.19, 0.03)
                    b12 = np.random.normal(0.11, 0.02)
                    bsi = np.random.normal(-0.20, 0.06)
                    lc_code = 2
                else:
                    b02 = np.random.normal(0.08, 0.02)
                    b03 = np.random.normal(0.10, 0.02)
                    b04 = np.random.normal(0.12, 0.025)
                    b05 = np.random.normal(0.13, 0.025)
                    b06 = np.random.normal(0.14, 0.025)
                    b07 = np.random.normal(0.15, 0.025)
                    b08 = np.random.normal(0.16, 0.03)
                    b8a = np.random.normal(0.17, 0.03)
                    b11 = np.random.normal(0.19, 0.035)
                    b12 = np.random.normal(0.15, 0.03)
                    bsi = np.random.normal(0.03, 0.04)
                    lc_code = 1
                    
                elevation = np.random.uniform(20, 1100)
                slope = np.random.uniform(0, 40)
                aspect = np.random.uniform(0, 360)
                curvature = np.random.normal(0.0, 0.04)
                ruggedness = np.random.uniform(2, 30)
                
                litho_code = np.random.choice([0, 1], p=[0.85, 0.15]) # Minor litho overlap
                rock_type = 1
                geo_age = 3
                
                drain_dens = np.random.uniform(0.1, 0.8)
                dist_water = np.random.uniform(0.5, 12.0)
                road_prox = np.random.uniform(0.1, 0.8)
                
                label = 0
                grade = 0.0

                
            eps = 1e-6
            ndvi = (b08 - b04) / (b08 + b04 + eps)
            ndwi = (b03 - b08) / (b03 + b08 + eps)
            nbr = (b08 - b12) / (b08 + b12 + eps)
            b11_b08 = b11 / (b08 + eps)
            b12_b11 = b12 / (b11 + eps)
            b04_b02 = b04 / (b02 + eps)
            b11_b12 = b11 / (b12 + eps)
            re1 = b05 / (b04 + eps)
            re2 = b06 / (b05 + eps)
            
            row = [
                b02, b03, b04, b05, b06, b07, b08, b8a, b11, b12,
                ndvi, ndwi, nbr, b11_b08, b12_b11, b04_b02, b11_b12, re1, re2,
                elevation, slope, aspect, curvature, ruggedness,
                litho_code, rock_type, geo_age, fault_dist, lineament_dens,
                bsi, lc_code, drain_dens, dist_water, dist_deposit, road_prox
            ]
            
            X_rows.append(row)
            y_class.append(label)
            y_grade.append(grade)
            cluster_ids.append(cid)
            
    df = pd.DataFrame(X_rows, columns=FEATURE_NAMES)
    df["label"] = y_class
    df["grade_mn_pct"] = y_grade
    df["spatial_cluster_id"] = cluster_ids
    return df

def compute_model_metrics(model_name, model, X, y, groups):
    """
    Evaluates classifier using 5-Fold Spatial GroupKFold Cross-Validation.
    Computes ROC-AUC, PR-AUC, Precision, Recall, F1, and Confusion Matrix.
    """
    gkf = GroupKFold(n_splits=5)
    
    y_true_all = []
    y_pred_all = []
    y_prob_all = []
    
    for train_idx, val_idx in gkf.split(X, y, groups):
        X_tr, X_val = X.iloc[train_idx], X.iloc[val_idx]
        y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]
        
        m_clone = joblib.load(joblib.dump(model, 'scratch_tmp.pkl')) if False else model
        m_clone.fit(X_tr, y_tr)
        
        preds = m_clone.predict(X_val)
        probs = m_clone.predict_proba(X_val)[:, 1] if hasattr(m_clone, "predict_proba") else m_clone.decision_function(X_val)
        
        y_true_all.extend(y_val)
        y_pred_all.extend(preds)
        y_prob_all.extend(probs)
        
    y_true_all = np.array(y_true_all)
    y_pred_all = np.array(y_pred_all)
    y_prob_all = np.array(y_prob_all)
    
    roc_auc = float(roc_auc_score(y_true_all, y_prob_all))
    precisions, recalls, _ = precision_recall_curve(y_true_all, y_prob_all)
    pr_auc = float(auc(recalls, precisions))
    
    acc = float(accuracy_score(y_true_all, y_pred_all))
    prec = float(precision_score(y_true_all, y_pred_all))
    rec = float(recall_score(y_true_all, y_pred_all))
    f1 = float(f1_score(y_true_all, y_pred_all))
    cm = confusion_matrix(y_true_all, y_pred_all).tolist()
    
    # Fit final model on full dataset for inference
    model.fit(X, y)
    
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        importances = np.abs(model.coef_[0])
    else:
        importances = np.zeros(len(FEATURE_NAMES))
        
    feat_imp = dict(zip(FEATURE_NAMES, [round(float(v), 4) for v in importances]))
    
    return {
        "name": model_name,
        "validation_method": "5-Fold Spatial GroupKFold Cross-Validation",
        "roc_auc": round(roc_auc, 4),
        "pr_auc": round(pr_auc, 4),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "feature_importances": feat_imp
    }

def train_ensemble_models():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_dir = os.path.join(base_dir, "data")
    ensemble_output_path = os.path.join(data_dir, "manganese_ensemble.pkl")
    
    print("Generating 35-Feature Dataset across 10 Spatial Mining Clusters in India...")
    df = generate_spatial_dataset(num_samples=2000)
    
    X = df[FEATURE_NAMES]
    y_class = df["label"]
    y_grade = df["grade_mn_pct"]
    groups = df["spatial_cluster_id"]
    
    print("\n--- [Model 1] Logistic Regression (L2 Baseline) ---")
    lr_model = LogisticRegression(max_iter=1000, random_state=42)
    lr_metrics = compute_model_metrics("Logistic Regression", lr_model, X, y_class, groups)
    print(f"Logistic Regression -> ROC-AUC: {lr_metrics['roc_auc']}, PR-AUC: {lr_metrics['pr_auc']}, F1: {lr_metrics['f1_score']}")

    print("\n--- [Model 2] Random Forest Classifier (150 Trees) ---")
    rf_model = RandomForestClassifier(n_estimators=150, max_depth=10, min_samples_split=3, random_state=42, class_weight="balanced")
    rf_metrics = compute_model_metrics("Random Forest Classifier", rf_model, X, y_class, groups)
    print(f"Random Forest -> ROC-AUC: {rf_metrics['roc_auc']}, PR-AUC: {rf_metrics['pr_auc']}, F1: {rf_metrics['f1_score']}")

    print("\n--- [Model 3] Gradient Boosting Classifier (XGBoost Equivalent) ---")
    gb_model = GradientBoostingClassifier(n_estimators=120, max_depth=4, learning_rate=0.07, random_state=42)
    gb_metrics = compute_model_metrics("Gradient Boosting (XGBoost)", gb_model, X, y_class, groups)
    print(f"Gradient Boosting -> ROC-AUC: {gb_metrics['roc_auc']}, PR-AUC: {gb_metrics['pr_auc']}, F1: {gb_metrics['f1_score']}")
    
    print("\n--- [Model 4] Gradient Boosting Regressor (Ore Grade % Mn) ---")
    gb_regressor = GradientBoostingRegressor(n_estimators=100, max_depth=5, learning_rate=0.08, random_state=42)
    gb_regressor.fit(X[y_class == 1], y_grade[y_class == 1])
    y_g_pred = gb_regressor.predict(X[y_class == 1])
    rmse = float(np.sqrt(mean_squared_error(y_grade[y_class == 1], y_g_pred)))
    print(f"Ore Grade Regressor RMSE: {rmse:.2f}% Mn")
    
    print("\n--- [Model 5] K-Means Unsupervised Spectral Clustering (4 Clusters) ---")
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    kmeans.fit(X)
    
    jamda_koira_reference = [
        0.07, 0.09, 0.18, 0.20, 0.21, 0.22, 0.13, 0.14, 0.32, 0.25,
        0.28, -0.18, 0.12, 2.46, 0.78, 2.57, 1.28, 1.11, 1.05,
        450.0, 15.0, 180.0, 0.02, 25.0,
        1, 2, 1, 1.2, 2.2,
        0.18, 1, 0.8, 3.5, 1.2, 0.85
    ]
    
    cluster_labels = {
        0: "Gondite Supergene High-Grade Prospectivity Zone (Jamda-Koira / Balaghat Signature)",
        1: "Lateritic Manganese Surface Alteration Cap",
        2: "Sedimentary Carbonate Host Rock",
        3: "Non-Mineralized Surface / Vegetation Canopy"
    }
    
    ensemble_payload = {
        "classifier": rf_model,
        "rf_classifier": rf_model,
        "gb_classifier": gb_model,
        "lr_classifier": lr_model,
        "regressor": gb_regressor,
        "kmeans": kmeans,
        "jamda_koira_reference": jamda_koira_reference,
        "cluster_labels": cluster_labels,
        "feature_names": FEATURE_NAMES,
        "validation_strategy": "Spatial GroupKFold (10 Indian Mining Belts)",
        "benchmarks": {
            "logistic_regression": lr_metrics,
            "random_forest": rf_metrics,
            "gradient_boosting": gb_metrics,
            "ore_grade_regressor_rmse": round(rmse, 2)
        }
    }
    
    joblib.dump(ensemble_payload, ensemble_output_path)
    print(f"\n[OK] Spatial GroupKFold Ensemble Models & Benchmarks saved successfully to: {ensemble_output_path}")

if __name__ == "__main__":
    train_ensemble_models()
