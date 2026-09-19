import numpy as np

"""
Feature Extraction Engine for AI Manganese Mineral Prospectivity Mapping System for India.

SCIENTIFIC DISCLAIMER & NOTICE:
Multi-spectral satellite ratios (SWIR1/NIR, Ferric Iron, SWIR2/SWIR1, Red-Edge ratios) reflect 
altered surface lithology, weathering, and mineral alteration halos (ferric/manganiferous oxides, clays).
They do NOT constitute direct chemical identification of specific mineral species (e.g. pyrolusite, psilomelane).
Target predictions represent "Manganese Mineral Prospectivity Zones" and "Candidate Exploration Areas", not confirmed ore reserves.
"""

FEATURE_NAMES = [
    # Sentinel-2 Bands (10)
    "b02", "b03", "b04", "b05", "b06", "b07", "b08", "b8a", "b11", "b12",
    # Spectral Ratios & Indices (9)
    "ndvi", "ndwi", "nbr", "b11_b08_ratio", "b12_b11_ratio", "b04_b02_ratio", "b11_b12_ratio", "red_edge_1_ratio", "red_edge_2_ratio",
    # Terrain Features (5)
    "elevation", "slope", "aspect", "curvature", "terrain_ruggedness",
    # Geological Features (5)
    "lithology_code", "rock_type_encoded", "geological_age_code", "fault_distance_km", "lineament_density",
    # Land Cover & Soil Features (2)
    "bare_soil_index", "land_cover_code",
    # Hydrology & Proximity (3)
    "drainage_density", "distance_to_water_km", "dist_to_known_deposit_km",
    # Logistics (1 - optional layer separation)
    "road_proximity_score"
]

def compute_spectral_indices(
    b02: float, b03: float, b04: float, b05: float, b06: float,
    b07: float, b08: float, b8a: float, b11: float, b12: float
) -> dict:
    """
    Computes remote sensing indices from 10 Sentinel-2 surface reflectance bands:
    - B02 (Blue 490nm), B03 (Green 560nm), B04 (Red 665nm)
    - B05 (Red Edge 1 705nm), B06 (Red Edge 2 740nm), B07 (Red Edge 3 783nm)
    - B08 (NIR 842nm), B8A (Narrow NIR 865nm)
    - B11 (SWIR1 1610nm), B12 (SWIR2 2190nm)
    """
    eps = 1e-6
    
    # Spectral Ratios & Indices
    ndvi = round(float((b08 - b04) / (b08 + b04 + eps)), 4)
    ndwi = round(float((b03 - b08) / (b03 + b08 + eps)), 4)
    nbr = round(float((b08 - b12) / (b08 + b12 + eps)), 4)
    
    b11_b08_ratio = round(float(b11 / (b08 + eps)), 4)
    b12_b11_ratio = round(float(b12 / (b11 + eps)), 4)
    b04_b02_ratio = round(float(b04 / (b02 + eps)), 4)
    b11_b12_ratio = round(float(b11 / (b12 + eps)), 4)
    
    red_edge_1_ratio = round(float(b05 / (b04 + eps)), 4)
    red_edge_2_ratio = round(float(b06 / (b05 + eps)), 4)
    
    # Bare Soil Index (BSI)
    bsi_num = (b11 + b04) - (b08 + b02)
    bsi_den = (b11 + b04) + (b08 + b02) + eps
    bare_soil_index = round(float(bsi_num / bsi_den), 4)

    return {
        "b02": round(float(b02), 4),
        "b03": round(float(b03), 4),
        "b04": round(float(b04), 4),
        "b05": round(float(b05), 4),
        "b06": round(float(b06), 4),
        "b07": round(float(b07), 4),
        "b08": round(float(b08), 4),
        "b8a": round(float(b8a), 4),
        "b11": round(float(b11), 4),
        "b12": round(float(b12), 4),
        "ndvi": ndvi,
        "ndwi": ndwi,
        "nbr": nbr,
        "b11_b08_ratio": b11_b08_ratio,
        "b12_b11_ratio": b12_b11_ratio,
        "b04_b02_ratio": b04_b02_ratio,
        "b11_b12_ratio": b11_b12_ratio,
        "red_edge_1_ratio": red_edge_1_ratio,
        "red_edge_2_ratio": red_edge_2_ratio,
        "bare_soil_index": bare_soil_index,
        "composite_mn_sig": round(float((b04 * b11) / (b02 * b08 + eps)), 4)
    }

def build_feature_vector(
    spectral: dict,
    terrain: dict,
    geology: dict,
    landcover: dict,
    hydrology: dict,
    dist_to_known_deposit_km: float,
    road_proximity_score: float = 0.5
) -> list:
    """
    Assembles complete 35-element feature vector matching ML ensemble model schema.
    """
    return [
        # Sentinel-2 Bands (10)
        float(spectral.get("b02", 0.08)),
        float(spectral.get("b03", 0.10)),
        float(spectral.get("b04", 0.12)),
        float(spectral.get("b05", 0.15)),
        float(spectral.get("b06", 0.18)),
        float(spectral.get("b07", 0.20)),
        float(spectral.get("b08", 0.22)),
        float(spectral.get("b8a", 0.23)),
        float(spectral.get("b11", 0.25)),
        float(spectral.get("b12", 0.20)),
        # Indices (9)
        float(spectral.get("ndvi", 0.2)),
        float(spectral.get("ndwi", -0.1)),
        float(spectral.get("nbr", 0.05)),
        float(spectral.get("b11_b08_ratio", 1.2)),
        float(spectral.get("b12_b11_ratio", 0.9)),
        float(spectral.get("b04_b02_ratio", 1.5)),
        float(spectral.get("b11_b12_ratio", 1.1)),
        float(spectral.get("red_edge_1_ratio", 1.2)),
        float(spectral.get("red_edge_2_ratio", 1.2)),
        # Terrain (5)
        float(terrain.get("elevation", 350.0)),
        float(terrain.get("slope", 10.0)),
        float(terrain.get("aspect", 180.0)),
        float(terrain.get("curvature", 0.0)),
        float(terrain.get("terrain_ruggedness", 15.0)),
        # Geology (5)
        float(geology.get("lithology_code", 1)),
        float(geology.get("rock_type_encoded", 2)),
        float(geology.get("geological_age_code", 1)),
        float(geology.get("fault_distance_km", 5.0)),
        float(geology.get("lineament_density", 0.8)),
        # Land Cover & Soil (2)
        float(landcover.get("bare_soil_index", 0.1)),
        float(landcover.get("land_cover_code", 1)),
        # Hydrology & Proximity (3)
        float(hydrology.get("drainage_density", 0.5)),
        float(hydrology.get("distance_to_water_km", 3.0)),
        float(dist_to_known_deposit_km),
        # Logistics (1)
        float(road_proximity_score)
    ]

