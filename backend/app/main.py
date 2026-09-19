import sys
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.ml.model import get_predictor
from app.services.sentinel_service import fetch_sentinel2_bands_for_bbox, sample_cell_spectral_bands
from app.services.geological_service import get_geological_service
from app.services.elevation_service import get_elevation_and_slope
from app.services.osm_service import get_infrastructure_accessibility
from app.services.state_service import get_state_service

app = FastAPI(
    title="AI Manganese Mineral Prospectivity Mapping System API - India",
    description="Multi-Spectral Satellite Remote Sensing & Spatial GroupKFold Machine Learning Prospectivity Mapping Engine",
    version="2.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRegionRequest(BaseModel):
    min_lat: float = Field(..., description="Minimum latitude (South)")
    min_lng: float = Field(..., description="Minimum longitude (West)")
    max_lat: float = Field(..., description="Maximum latitude (North)")
    max_lng: float = Field(..., description="Maximum longitude (East)")
    grid_size: Optional[int] = Field(5, description="Number of subdivisions per axis (e.g., 5x5 = 25 cells)")
    model_type: Optional[str] = Field("rf", description="Classifier model to use: 'rf' (Random Forest), 'gbm' (Gradient Boosting), 'lr' (Logistic Regression)")

class AnalyzeStateRequest(BaseModel):
    state_id: str = Field(..., description="Indian State ID (e.g., 'odisha', 'madhya_pradesh', 'maharashtra', 'karnataka')")
    grid_size: Optional[int] = Field(5, description="Subdivision resolution per district")
    model_type: Optional[str] = Field("rf", description="Classifier model to use: 'rf' (Random Forest), 'gbm' (Gradient Boosting), 'lr' (Logistic Regression)")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI Manganese Mineral Prospectivity Mapping System for India",
        "model_loaded": True
    }

@app.get("/api/data-provenance")
def get_data_provenance():
    """
    Returns documentation metadata for all 12 primary datasets used in the architecture.
    """
    doc_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "DATA_SOURCES.md")
    content = ""
    if os.path.exists(doc_path):
        with open(doc_path, "r", encoding="utf-8") as f:
            content = f.read()
            
    return {
        "title": "Data Sources & Scientific Provenance",
        "markdown": content,
        "dataset_count": 12,
        "primary_source_orgs": [
            "Copernicus Data Space Ecosystem (CDSE)",
            "Geological Survey of India (GSI)",
            "United States Geological Survey (USGS)",
            "NASA SRTM DEM",
            "Indian Bureau of Mines (IBM)",
            "OpenStreetMap Contributors",
            "FAO Soil Portal",
            "Copernicus Global Land Service (CGLS)"
        ]
    }

@app.get("/api/model-benchmarks")
def get_model_benchmarks():
    """Returns comparative validation metrics across Logistic Regression, Random Forest, and Gradient Boosting (XGBoost)."""
    predictor = get_predictor()
    benchmarks = predictor.get_benchmarks()
    return {
        "models_evaluated": ["Logistic Regression Baseline", "Random Forest Classifier", "Gradient Boosting (XGBoost)"],
        "validation_strategy": "5-Fold Spatial GroupKFold Cross-Validation across 10 Indian Mining Belts",
        "target_task": "Manganese Mineral Prospectivity Zone Classification & Ore Grade % Regression",
        "benchmarks": benchmarks
    }

@app.get("/api/india-states")
def get_india_states():
    """Returns list of all Indian States with manganese reserve status and district counts."""
    state_svc = get_state_service()
    return {
        "count": len(state_svc.get_all_states()),
        "states": state_svc.get_all_states()
    }

@app.get("/api/known-deposits")
def get_known_deposits():
    """Returns ground-truth USGS MRDS & GSI Manganese deposit locations in India."""
    geo_service = get_geological_service()
    return {
        "count": len(geo_service.get_known_deposits()),
        "deposits": geo_service.get_known_deposits()
    }

@app.get("/api/sample-regions")
def get_sample_regions():
    """Returns preset high-value Indian manganese prospectivity exploration bounding boxes."""
    return [
        {
            "id": "odisha_india",
            "name": "Jamda-Koira & Keonjhar Belt",
            "region": "Odisha, India",
            "bbox": {"min_lat": 21.75, "min_lng": 85.15, "max_lat": 22.15, "max_lng": 85.55},
            "description": "India's largest manganese producing belt hosting high-grade supergene oxide ores in Iron Ore Series metasediments."
        },
        {
            "id": "balaghat_mp",
            "name": "Bharweli & Balaghat Ore Field",
            "region": "Madhya Pradesh, India",
            "bbox": {"min_lat": 21.65, "min_lng": 80.05, "max_lat": 21.95, "max_lng": 80.35},
            "description": "Asia's largest underground manganese mine hosting Precambrian gondite metasedimentary ores."
        },
        {
            "id": "bhandara_mh",
            "name": "Dongri-Buzurg & Nagpur Belt",
            "region": "Maharashtra, India",
            "bbox": {"min_lat": 21.40, "min_lng": 79.50, "max_lat": 21.70, "max_lng": 79.80},
            "description": "High-grade supergene manganese prospectivity belt."
        },
        {
            "id": "sandur_ka",
            "name": "Sandur-Bellary Manganese Belt",
            "region": "Karnataka, India",
            "bbox": {"min_lat": 14.95, "min_lng": 76.40, "max_lat": 15.25, "max_lng": 76.70},
            "description": "Dharwar Craton iron-manganese formation with extensive lateritic and residual ores."
        }
    ]

@app.get("/api/market-shortfall")
def get_market_shortfall():
    """Returns Indian & Global Manganese Commodity Market & EV Battery Shortfall Analysis."""
    return {
        "commodity": "Manganese Ore (India Focus)",
        "current_price_usd_per_tonne": 340.0,
        "hpmsm_battery_grade_price_usd_per_tonne": 1250.0,
        "india_annual_production_tonnes": 3100000,
        "projected_deficit_by_2030_pct": 28.5,
        "ev_battery_demand_growth_cagr": "24.2%",
        "key_insights": [
            "Odisha and Madhya Pradesh account for over 70% of India's total high-grade manganese ore reserves.",
            "MOIL (Manganese Ore India Limited) operates the deepest underground manganese mine at Bharweli, Balaghat.",
            "Satellite AI prospectivity mapping accelerates greenfield mineral exploration across Precambrian Gondite belts."
        ],
        "supply_by_country": [
            {"country": "South Africa", "share_pct": 36.5},
            {"country": "Gabon", "share_pct": 18.2},
            {"country": "Australia", "share_pct": 13.8},
            {"country": "China", "share_pct": 8.1},
            {"country": "India (Odisha/MP/MH)", "share_pct": 5.4},
            {"country": "Others", "share_pct": 18.0}
        ]
    }

@app.post("/api/analyze-state")
def analyze_state(req: AnalyzeStateRequest):
    """
    State-Wide Prospectivity Analysis Endpoint:
    Ranks districts by manganese mineral prospectivity score & estimated ore grade (% Mn).
    """
    state_svc = get_state_service()
    state_data = state_svc.get_state_by_id(req.state_id)
    
    if not state_data:
        raise HTTPException(status_code=404, detail=f"State '{req.state_id}' not found in database.")
        
    predictor = get_predictor()
    geo_service = get_geological_service()
    
    districts_analysis = []
    selected_model_type = req.model_type or "rf"
    
    for dist in state_data.get("districts", []):
        c_lat = dist["center"]["lat"]
        c_lng = dist["center"]["lng"]
        
        dep_info = geo_service.find_nearest_deposit(c_lat, c_lng)
        elev_info = get_elevation_and_slope(c_lat, c_lng)
        spectral_data = sample_cell_spectral_bands(c_lat, c_lng, dep_info["distance_km"])
        geo_env = geo_service.get_cell_geology_and_environment(c_lat, c_lng, dep_info["distance_km"])
        
        terrain_dict = {
            "elevation": elev_info["elevation_meters"],
            "slope": elev_info["slope_degrees"],
            "aspect": 180.0,
            "curvature": 0.0,
            "terrain_ruggedness": 15.0
        }
        
        pred_result = predictor.predict_cell_probability(
            spectral=spectral_data,
            terrain=terrain_dict,
            geology=geo_env["geology"],
            landcover=geo_env["landcover"],
            hydrology=geo_env["hydrology"],
            dist_to_deposit_km=dep_info["distance_km"],
            road_prox=0.5,
            model_type=selected_model_type
        )
        
        districts_analysis.append({
            "district_id": dist["id"],
            "district_name": dist["name"],
            "center": dist["center"],
            "bbox": dist["bbox"],
            "known_belt": dist.get("known_belt", "Geological Ore Zone"),
            "probability_percent": pred_result["probability_percent"],
            "estimated_grade_mn_pct": pred_result["estimated_grade_mn_pct"],
            "category": pred_result["category"],
            "color_tier": pred_result["color_tier"],
            "cluster_label": pred_result["cluster_label"],
            "jamda_koira_similarity_pct": pred_result["jamda_koira_similarity_pct"],
            "model_used": pred_result["model_used"],
            "signals": {
                "swir1_nir_ratio": spectral_data["b11_b08_ratio"],
                "ferric_iron_ratio": spectral_data["b04_b02_ratio"],
                "mn_oxide_index": spectral_data["b12_b11_ratio"],
                "nearest_deposit_name": dep_info["nearest_deposit_name"],
                "dist_to_known_deposit_km": dep_info["distance_km"],
                "elevation_meters": elev_info["elevation_meters"]
            }
        })

    sorted_districts = sorted(districts_analysis, key=lambda d: (d["probability_percent"], d["estimated_grade_mn_pct"]), reverse=True)
    top_district = sorted_districts[0] if sorted_districts else None
    
    target_bbox = top_district["bbox"] if top_district else state_data["bbox"]
    region_analysis = analyze_region(AnalyzeRegionRequest(
        min_lat=target_bbox["min_lat"],
        min_lng=target_bbox["min_lng"],
        max_lat=target_bbox["max_lat"],
        max_lng=target_bbox["max_lng"],
        grid_size=req.grid_size or 5
    ))

    return {
        "state_id": state_data["id"],
        "state_name": state_data["name"],
        "national_share_pct": state_data.get("national_share_pct", 0.0),
        "manganese_reserve_rank": state_data.get("manganese_reserve_rank", 99),
        "bbox": state_data["bbox"],
        "center": state_data["center"],
        "top_district": {
            "district_id": top_district["district_id"],
            "district_name": top_district["district_name"],
            "probability_percent": top_district["probability_percent"],
            "estimated_grade_mn_pct": top_district["estimated_grade_mn_pct"],
            "headline": f"Top Prospectivity District in {state_data['name']}: {top_district['district_name']}",
            "key_driver": f"{top_district['probability_percent']}% Prospectivity Score ({top_district['estimated_grade_mn_pct']}% Mn Grade) — Highest in {state_data['name']}"
        } if top_district else None,
        "districts_ranking": sorted_districts,
        "grid_analysis": region_analysis
    }

@app.post("/api/analyze-region")
def analyze_region(req: AnalyzeRegionRequest):
    """
    Core AI Prospectivity Analysis Endpoint for specific bounding box grid.
    """
    if req.max_lat <= req.min_lat or req.max_lng <= req.min_lng:
        raise HTTPException(status_code=400, detail="Invalid bounding box coordinates.")
        
    grid_size = max(2, min(10, req.grid_size or 5))
    
    sentinel_meta = fetch_sentinel2_bands_for_bbox(req.min_lat, req.min_lng, req.max_lat, req.max_lng)
    infra_data = get_infrastructure_accessibility(req.min_lat, req.min_lng, req.max_lat, req.max_lng)
    
    lat_step = (req.max_lat - req.min_lat) / grid_size
    lng_step = (req.max_lng - req.min_lng) / grid_size
    
    predictor = get_predictor()
    geo_service = get_geological_service()
    
    grid_cells = []
    zone_index = 1
    
    for i in range(grid_size):
        cell_min_lat = req.min_lat + i * lat_step
        cell_max_lat = cell_min_lat + lat_step
        
        for j in range(grid_size):
            cell_min_lng = req.min_lng + j * lng_step
            cell_max_lng = cell_min_lng + lng_step
            
            center_lat = round((cell_min_lat + cell_max_lat) / 2.0, 5)
            center_lng = round((cell_min_lng + cell_max_lng) / 2.0, 5)
            
            dep_info = geo_service.find_nearest_deposit(center_lat, center_lng)
            elev_info = get_elevation_and_slope(center_lat, center_lng)
            spectral_data = sample_cell_spectral_bands(center_lat, center_lng, dep_info["distance_km"])
            geo_env = geo_service.get_cell_geology_and_environment(center_lat, center_lng, dep_info["distance_km"])
            
            terrain_dict = {
                "elevation": elev_info["elevation_meters"],
                "slope": elev_info["slope_degrees"],
                "aspect": 180.0,
                "curvature": 0.0,
                "terrain_ruggedness": 15.0
            }
            
            selected_model = req.model_type or "rf"
            pred_result = predictor.predict_cell_probability(
                spectral=spectral_data,
                terrain=terrain_dict,
                geology=geo_env["geology"],
                landcover=geo_env["landcover"],
                hydrology=geo_env["hydrology"],
                dist_to_deposit_km=dep_info["distance_km"],
                road_prox=infra_data["accessibility_score"],
                model_type=selected_model
            )
            
            cell_data = {
                "cell_id": f"Zone {zone_index}",
                "bounds": {
                    "min_lat": round(cell_min_lat, 5),
                    "min_lng": round(cell_min_lng, 5),
                    "max_lat": round(cell_max_lat, 5),
                    "max_lng": round(cell_max_lng, 5)
                },
                "center": {
                    "latitude": center_lat,
                    "longitude": center_lng
                },
                "probability_percent": pred_result["probability_percent"],
                "estimated_grade_mn_pct": pred_result["estimated_grade_mn_pct"],
                "category": pred_result["category"],
                "color_tier": pred_result["color_tier"],
                "cluster_label": pred_result["cluster_label"],
                "jamda_koira_similarity_pct": pred_result["jamda_koira_similarity_pct"],
                "model_used": pred_result["model_used"],
                "signals": {
                    "swir1_nir_ratio": spectral_data["b11_b08_ratio"],
                    "ferric_iron_ratio": spectral_data["b04_b02_ratio"],
                    "mn_oxide_index": spectral_data["b12_b11_ratio"],
                    "ndvi": spectral_data["ndvi"],
                    "bare_soil_index": spectral_data["bare_soil_index"],
                    "scene_classification": spectral_data["scene_classification_mask"],
                    "elevation_meters": elev_info["elevation_meters"],
                    "slope_degrees": elev_info["slope_degrees"],
                    "lithology_name": geo_env["geology"]["lithology_name"],
                    "fault_distance_km": geo_env["geology"]["fault_distance_km"],
                    "lineament_density": geo_env["geology"]["lineament_density"],
                    "dist_to_known_deposit_km": dep_info["distance_km"],
                    "nearest_deposit_name": dep_info["nearest_deposit_name"],
                    "deposit_type": dep_info["deposit_type"],
                    "road_accessibility_score": infra_data["accessibility_score"]
                },
                "bands": {
                    "B02_Blue": spectral_data["b02"],
                    "B03_Green": spectral_data["b03"],
                    "B04_Red": spectral_data["b04"],
                    "B05_RedEdge1": spectral_data["b05"],
                    "B06_RedEdge2": spectral_data["b06"],
                    "B07_RedEdge3": spectral_data["b07"],
                    "B08_NIR": spectral_data["b08"],
                    "B8A_NarrowNIR": spectral_data["b8a"],
                    "B11_SWIR1": spectral_data["b11"],
                    "B12_SWIR2": spectral_data["b12"]
                }
            }
            
            grid_cells.append(cell_data)
            zone_index += 1

    sorted_cells = sorted(grid_cells, key=lambda c: c["probability_percent"], reverse=True)
    top_cell = sorted_cells[0] if sorted_cells else None
    
    top_zone_callout = None
    if top_cell:
        top_zone_callout = {
            "cell_id": top_cell["cell_id"],
            "probability_percent": top_cell["probability_percent"],
            "estimated_grade_mn_pct": top_cell["estimated_grade_mn_pct"],
            "center": top_cell["center"],
            "headline": f"{top_cell['cell_id']}: {top_cell['probability_percent']}% Prospectivity ({top_cell['estimated_grade_mn_pct']}% Mn Grade) — Highest in Selection",
            "key_driver": f"High SWIR1/NIR ({top_cell['signals']['swir1_nir_ratio']}), Lithology: {top_cell['signals']['lithology_name']}, {top_cell['signals']['dist_to_known_deposit_km']}km from {top_cell['signals']['nearest_deposit_name']}"
        }

    return {
        "bounding_box": {
            "min_lat": req.min_lat,
            "min_lng": req.min_lng,
            "max_lat": req.max_lat,
            "max_lng": req.max_lng
        },
        "satellite_metadata": sentinel_meta,
        "infrastructure": infra_data,
        "grid_resolution": f"{grid_size}x{grid_size} ({len(grid_cells)} sub-zones)",
        "top_zone": top_zone_callout,
        "grid_cells": grid_cells
    }
