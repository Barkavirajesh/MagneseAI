# AI-Powered Manganese Reserve Detection System

An end-to-end geospatial web application that allows users to select any region on an interactive world map, automatically fetches real Sentinel-2 satellite multi-spectral imagery, USGS MRDS deposit records, SRTM elevation, and OSM infrastructure data live, processes it through a trained **Random Forest AI Model**, and displays a color-coded probability heatmap with highlighted top deposit zones.

---

## 🌟 Key Features

1. **Interactive Bounding Box Explorer**: Draw or input latitude/longitude coordinates anywhere on Earth (e.g., Odisha Manganese Belt in India, Kalahari Field in South Africa, Carajás in Brazil, or Groote Eylandt in Australia).
2. **Live Multi-Spectral Band Extraction**: Queries free public **Sentinel-2 L2A STAC APIs** for real-time B02 (Blue), B04 (Red), B08 (NIR), B11 (SWIR1), and B12 (SWIR2) reflectance values.
3. **Remote Sensing Mineral Ratios**:
   - **SWIR1 / NIR Ratio (B11 / B08)**: Primary indicator for iron-manganese oxides & alteration minerals.
   - **Ferric Iron Index (B04 / B02)**: Red-to-blue spectral ratio.
   - **Manganese Oxide / Carbonate Index (B12 / B11)**: SWIR2 to SWIR1 ratio.
   - **NDVI Vegetation Mask**: Bare rock/soil exposure filter.
4. **Random Forest AI Classifier**: Trained with `scikit-learn` on positive USGS MRDS deposit profiles vs background terrain, outputting continuous deposit probability scores (0% to 100%) per sub-zone cell.
5. **Top Deposit Zone Callout**: Highlights the #1 highest-probability sub-zone cell with a glowing callout badge and detailed spectral signal breakdown.
6. **Market Shortfall Forecast Module**: Includes real USGS commodity statistics and EV battery demand projections for High-Purity Manganese Sulphate Monohydrate (HPMSM).

---

## 🛠️ Architecture

- **Backend**: Python 3.13, FastAPI, Uvicorn, Scikit-Learn, Rasterio, PySTAC-Client, Pandas, NumPy.
- **Frontend**: React 18, Vite, Leaflet.js, Tailwind CSS, Lucide Icons.
- **Data Sources**:
  - Sentinel-2 L2A via AWS Earth Search STAC / Copernicus Data Space
  - USGS Mineral Resources Data System (MRDS) Manganese Dataset
  - SRTM Elevation & Terrain Gradient
  - OpenStreetMap (OSM) Overpass Infrastructure API

---

## 🚀 Quick Start Guide

### 1. Launch Application
In the root directory `C:\Users\barka\OneDrive\Desktop\magneese`, run:
```bash
python start_app.py
```

Or start backend and frontend individually:

#### Start Backend:
```bash
cd backend
python run.py
```
*API will run on http://localhost:8000 (Swagger docs at http://localhost:8000/docs).*

#### Start Frontend:
```bash
cd frontend
npm run dev
```
*Frontend app will run on http://localhost:5173.*

---

## 🧪 Retraining the AI Model
To retrain the Random Forest Classifier on updated USGS deposit records:
```bash
python backend/app/ml/train.py
```
This updates `backend/data/manganese_model.pkl`.
