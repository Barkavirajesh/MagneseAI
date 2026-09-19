# Data Provenance & Dataset Architecture Documentation

This document records the official provenance, metadata, spatial resolution, licensing, and processing methodology for all 12 datasets integrated into the **AI-Based Manganese Mineral Prospectivity Mapping System for India**.

---

## 1. Sentinel-2 L2A Multispectral Satellite Data (Core Remote Sensing Dataset)
* **Dataset Name**: Sentinel-2 Level-2A Surface Reflectance (Atmospherically Corrected)
* **Source Organization**: European Space Agency (ESA) & Copernicus Data Space Ecosystem
* **Official URL**: [https://dataspace.copernicus.eu/](https://dataspace.copernicus.eu/) / [AWS Sentinel-2 STAC](https://registry.opendata.aws/sentinel-2/)
* **Download Date**: 2026-09-16
* **Dataset Version**: Sentinel-2 L2A Processing Baseline 05.00+
* **Spatial Resolution**: 10 meters ($B02, B03, B04, B08$), 20 meters ($B05, B06, B07, B8A, B11, B12$)
* **Coordinate Reference System**: WGS 84 / UTM Zone 44N & 45N (EPSG:32644 / EPSG:32645), reprojected to EPSG:4326
* **Bands Extracted**:
  * `B02` (Blue - 490nm), `B03` (Green - 560nm), `B04` (Red - 665nm)
  * `B05` (Red Edge 1 - 705nm), `B06` (Red Edge 2 - 740nm), `B07` (Red Edge 3 - 783nm)
  * `B08` (NIR - 842nm), `B8A` (Narrow NIR - 865nm)
  * `B11` (SWIR1 - 1610nm), `B12` (SWIR2 - 2190nm)
* **Spectral Indices Computed**:
  * $NDVI = (B08 - B04) / (B08 + B04)$
  * $NDWI = (B03 - B08) / (B03 + B08)$
  * $NBR = (B08 - B12) / (B08 + B12)$
  * $B11\_B08 = B11 / B08$ (SWIR1/NIR alteration ratio)
  * $B12\_B11 = B12 / B11$ (SWIR2/SWIR1 absorption ratio)
  * $B04\_B02 = B04 / B02$ (Ferric Iron alteraton index)
  * $B11\_B12 = B11 / B12$ (Clay/Sericite index)
  * `red_edge_1_ratio` ($B05 / B04$), `red_edge_2_ratio` ($B06 / B05$)
* **Processing Steps**: Cloud masking via Scene Classification Layer (SCL) and NDVI masking ($NDVI > 0.45$) to limit dense vegetation and isolate exposed rock/soil surfaces.
* **License**: Copernicus Open Access Data License
* **Limitations**: Satellite optical sensors measure surface skin reflectance ($0-5\text{cm}$) and cannot directly penetrate subsurface soil/rock layers.

---

## 2. Manganese Deposit / Occurrence Ground-Truth Dataset (Core Dataset)
* **Dataset Name**: USGS MRDS & GSI Manganese Deposit Compilation for India
* **Source Organization**: United States Geological Survey (USGS) Mineral Resources Data System & Geological Survey of India (GSI)
* **Official URL**: [https://mrdata.usgs.gov/mrds/](https://mrdata.usgs.gov/mrds/) / [https://www.gsi.gov.in/](https://www.gsi.gov.in/)
* **Download Date**: 2026-09-16
* **Required Fields**: `latitude`, `longitude`, `deposit_name`, `state`, `district`, `commodity`, `deposit_type`, `ore_grade_mn_percent`, `source`, `confidence`
* **Coverage**: 120+ geocoded ground-truth deposit locations across major Indian manganese belts:
  * Jamda-Koira Belt (Keonjhar, Sundargarh — Odisha)
  * Bharweli-Ukwa & Sausar Belt (Balaghat, Chhindwara — MP)
  * Dongri-Buzurg & Nagpur Belt (Bhandara, Nagpur — MH)
  * Sandur Schist Belt (Bellary — KA)
  * Garividi-Kodurite Series (Vizianagaram — AP)
* **License**: Public Domain (USGS) & GSI Open Data Portal
* **Limitations**: Historical MRDS points represent surface mines/occurrences; location accuracy varies between $\pm 100\text{m}$ and $\pm 1\text{km}$.

---

## 3. Geological & Lithological Dataset of India
* **Dataset Name**: Bhukosh Geological Map of India (1:2M Lithostratigraphic Units)
* **Source Organization**: Geological Survey of India (GSI)
* **Official URL**: [https://bhukosh.gsi.gov.in/](https://bhukosh.gsi.gov.in/)
* **Download Date**: 2026-09-16
* **Features Extracted**: `lithology`, `rock_type`, `geological_formation`, `geological_age`, `lithology_code`
* **Key Formations**: Gondite metasediments, Sausar Group, Dharwar Supergroup, Iron Ore Group (IOG), Khondalite Series, Champaner Group.
* **Processing Steps**: Categorical encoding into numeric lithological risk scores for machine learning model ingestion.
* **License**: Government of India Open Data License

---

## 4. NASA SRTM 30m Digital Elevation Model (Terrain Dataset)
* **Dataset Name**: NASA Shuttle Radar Topography Mission (SRTM) Global 1 Arc-Second DEM
* **Source Organization**: National Aeronautics and Space Administration (NASA) / USGS
* **Official URL**: [https://earthexplorer.usgs.gov/](https://earthexplorer.usgs.gov/)
* **Download Date**: 2026-09-16
* **Spatial Resolution**: 30 meters (1 arc-second)
* **Features Generated**: `elevation` (meters), `slope` (degrees), `aspect`, `hillshade`, `curvature`, `terrain_ruggedness` (TRI)
* **License**: Public Domain
* **Limitations**: Elevation and slope are treated as continuous predictor features in ML; no fixed elevation filter is imposed.

---

## 5. Soil & Land-Surface Dataset
* **Dataset Name**: FAO Soil Map of India & Bare Soil Index
* **Source Organization**: Food and Agriculture Organization (FAO) / Sentinel-2 Bare Soil Index
* **Official URL**: [https://www.fao.org/soils-portal/](https://www.fao.org/soils-portal/)
* **Features Extracted**: `bare_soil_index`, `soil_texture_class`
* **License**: CC-BY-NC-SA 3.0 IGO

---

## 6. Land-Cover & Vegetation Masking Dataset
* **Dataset Name**: Copernicus Global Land Cover 100m (CGLS-LC100) & Sentinel-2 SCL
* **Source Organization**: Copernicus Climate Change Service (C3S)
* **Official URL**: [https://land.copernicus.eu/global/products/lc100](https://land.copernicus.eu/global/products/lc100)
* **Features Extracted**: `land_cover_class` (Forest, Agriculture, Urban, Water, Bare Soil)
* **License**: Creative Commons Attribution 4.0 International

---

## 7. Structural Lineaments & Fault Dataset
* **Dataset Name**: GSI Seismotectonic Atlas of India & Lineament Density Map
* **Source Organization**: Geological Survey of India (GSI)
* **Features Extracted**: `fault_distance_km`, `lineament_distance_km`, `lineament_density`
* **Usage**: Treated as structural geological predictor features (fracture/fault corridors host hydrothermal alteration).

---

## 8. Drainage & Hydrology Dataset
* **Dataset Name**: HydroSHEDS India Drainage & River Network
* **Source Organization**: World Wildlife Fund (WWF) & USGS
* **Official URL**: [https://www.hydrosheds.org/](https://www.hydrosheds.org/)
* **Features Extracted**: `drainage_density`, `distance_to_water_km`

---

## 9. OpenStreetMap Infrastructure & Mining Accessibility Dataset
* **Dataset Name**: OpenStreetMap India Road & Transport Network
* **Source Organization**: OpenStreetMap Foundation (OSMF) via Overpass API
* **Official URL**: [https://overpass-api.de/](https://overpass-api.de/)
* **Features Extracted**: `distance_to_road_km`, `road_density`, `distance_to_railway_km`, `mining_accessibility_score`
* **Important Note**: Kept strictly as a separate **Mining Accessibility & Logistics Analysis Layer**; not used as a primary geological predictor for manganese presence.

---

## 10. Economic & Production Dataset
* **Dataset Name**: IBM Indian Minerals Yearbook (Manganese Chapter) & MOIL Reports
* **Source Organization**: Indian Bureau of Mines (IBM) & Manganese Ore India Limited (MOIL)
* **Official URL**: [https://ibm.gov.in/](https://ibm.gov.in/) / [https://moil.nic.in/](https://moil.nic.in/)
* **Report Version**: IBM Indian Minerals Yearbook 2023–2024 (Published 2024)
* **Metrics Reported**: State-wise annual production (3.10 Mt/yr), reserve shares (Odisha 44%, MP 27%, MH 12%), average pithead ore prices by grade ($340/t for 44%+ Mn, $1,250/t for battery-grade HPMSM).
* **Important Note**: Kept strictly separate from the mineral prospectivity machine learning model.

---

## 11. Administrative Boundaries Dataset
* **Dataset Name**: DataMeet India Maps & Survey of India State/District Boundaries
* **Source Organization**: DataMeet Community & Survey of India
* **Official URL**: [https://github.com/datameet/maps](https://github.com/datameet/maps)
* **Features Extracted**: State polygon boundaries, district centroids, bounding boxes.

---

## 12. Unified ML Feature Matrix Schema
All features are consolidated into a standardized 36-column ML dataset:
`latitude`, `longitude`, `B02`, `B03`, `B04`, `B05`, `B06`, `B07`, `B08`, `B8A`, `B11`, `B12`, `NDVI`, `NDWI`, `NBR`, `B11_B08`, `B12_B11`, `B04_B02`, `B11_B12`, `red_edge_1_ratio`, `red_edge_2_ratio`, `elevation`, `slope`, `aspect`, `curvature`, `terrain_ruggedness`, `lithology_code`, `geological_age_code`, `fault_distance_km`, `lineament_density`, `bare_soil_index`, `land_cover_code`, `drainage_density`, `distance_to_road_km`, `dist_to_known_deposit_km`, `manganese_prospectivity_label`.
