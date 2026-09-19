import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { INDIA_STATES_GEO } from '../data/indiaStatesGeo';
import { MousePointer, Award, X, MapPin } from 'lucide-react';

const INDIA_BOUNDS = {
  minLat: 6.5,
  maxLat: 35.5,
  minLng: 68.0,
  maxLng: 97.5
};

const findClosestState = (lat, lng) => {
  for (const st of INDIA_STATES_GEO) {
    const poly = st.polygon;
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    poly.forEach(([pLat, pLng]) => {
      if (pLat < minLat) minLat = pLat;
      if (pLat > maxLat) maxLat = pLat;
      if (pLng < minLng) minLng = pLng;
      if (pLng > maxLng) maxLng = pLng;
    });
    if (lat >= minLat - 0.8 && lat <= maxLat + 0.8 && lng >= minLng - 0.8 && lng <= maxLng + 0.8) {
      return st;
    }
  }

  let minDist = Infinity;
  let closest = INDIA_STATES_GEO[0];
  INDIA_STATES_GEO.forEach((st) => {
    const d = Math.hypot(lat - st.center[0], lng - st.center[1]);
    if (d < minDist) {
      minDist = d;
      closest = st;
    }
  });
  return closest;
};

export default function MapView({
  knownDeposits,
  analysisData,
  stateAnalysis,
  selectedStateId,
  onSelectState,
  isAnalyzing,
  onAnalyze,
  selectedZone,
  setSelectedZone,
  selectedBbox
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const gridLayersGroupRef = useRef(null);
  const clickMarkerRef = useRef(null);

  const [dismissTopBanner, setDismissTopBanner] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);

  useEffect(() => {
    if (stateAnalysis) {
      setDismissTopBanner(false);
    }
  }, [stateAnalysis]);

  useEffect(() => {
    if (mapInstanceRef.current && stateAnalysis && stateAnalysis.bbox) {
      const b = stateAnalysis.bbox;
      const bounds = [
        [b.min_lat, b.min_lng],
        [b.max_lat, b.max_lng]
      ];
      mapInstanceRef.current.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
    } else if (mapInstanceRef.current && selectedBbox) {
      const bounds = [
        [selectedBbox.min_lat, selectedBbox.min_lng],
        [selectedBbox.max_lat, selectedBbox.max_lng]
      ];
      mapInstanceRef.current.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 });
    }
  }, [selectedStateId, stateAnalysis, selectedBbox]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const leafletIndiaBounds = L.latLngBounds(
      L.latLng(INDIA_BOUNDS.minLat, INDIA_BOUNDS.minLng),
      L.latLng(INDIA_BOUNDS.maxLat, INDIA_BOUNDS.maxLng)
    );

    const map = L.map(mapRef.current, {
      center: [20.5937, 78.9629],
      zoom: 6,
      minZoom: 5,
      maxZoom: 15,
      maxBounds: leafletIndiaBounds,
      maxBoundsViscosity: 1.0,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    map.on('click', (e) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setClickedLocation({ lat: roundCoord(lat), lng: roundCoord(lng) });

      if (clickMarkerRef.current) {
        map.removeLayer(clickMarkerRef.current);
      }
      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        color: '#ffffff',
        fillColor: '#ef4444',
        fillOpacity: 0.95,
        weight: 3
      }).addTo(map);
      clickMarkerRef.current = marker;

      const matchedState = findClosestState(lat, lng);
      if (matchedState && onSelectState) {
        onSelectState(matchedState.id);
      }
    });

    const gridGroup = L.layerGroup().addTo(map);
    gridLayersGroupRef.current = gridGroup;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const roundCoord = (val) => Math.round(val * 10000) / 10000;

  useEffect(() => {
    if (!mapInstanceRef.current || !gridLayersGroupRef.current) return;

    const group = gridLayersGroupRef.current;
    group.clearLayers();

    if (knownDeposits && knownDeposits.length > 0) {
      knownDeposits.forEach((dep) => {
        if (dep.latitude >= INDIA_BOUNDS.minLat && dep.latitude <= INDIA_BOUNDS.maxLat &&
            dep.longitude >= INDIA_BOUNDS.minLng && dep.longitude <= INDIA_BOUNDS.maxLng) {
          
          const marker = L.circleMarker([dep.latitude, dep.longitude], {
            radius: 6,
            color: '#1e1b4b',
            fillColor: '#3b82f6',
            fillOpacity: 0.95,
            weight: 2
          });

          marker.bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <strong style="color: #1e1b4b; font-size: 13px;">🔵 Ground-Truth Deposit: ${dep.name}</strong><br/>
              <span style="font-size: 11px; color: #475569;">${dep.deposit_type} (${dep.state || 'India'})</span><br/>
              <span style="font-size: 11px; font-weight: bold; color: #059669;">Known Grade: ${dep.grade_percent}% Mn</span>
            </div>
          `);

          group.addLayer(marker);
        }
      });
    }

    if (analysisData && analysisData.grid_cells) {
      const topCellId = analysisData.top_zone ? analysisData.top_zone.cell_id : null;

      analysisData.grid_cells.forEach((cell) => {
        const b = cell.bounds;
        const cellBounds = [
          [b.min_lat, b.min_lng],
          [b.max_lat, b.max_lng]
        ];

        const isTop = topCellId === cell.cell_id;
        const isSelected = selectedZone && selectedZone.cell_id === cell.cell_id;

        let fillColor = '#10b981';
        if (cell.probability_percent >= 75) fillColor = '#ef4444';
        else if (cell.probability_percent >= 50) fillColor = '#f97316';
        else if (cell.probability_percent >= 30) fillColor = '#f59e0b';

        const strokeColor = isTop ? '#f59e0b' : (isSelected ? '#ffffff' : '#334155');
        const strokeWeight = isTop ? 3.5 : (isSelected ? 3 : 1);
        const fillOpacity = isTop ? 0.65 : 0.45;

        const polygon = L.rectangle(cellBounds, {
          color: strokeColor,
          weight: strokeWeight,
          fillColor: fillColor,
          fillOpacity: fillOpacity
        });

        polygon.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedZone(cell);
        });

        if (isTop) {
          polygon.bindTooltip(`
            <div style="font-weight: bold; color: #78350f; background: #fef3c7; border: 1px solid #f59e0b; padding: 4px 8px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
              ⭐ Top Candidate Exploration Area (${cell.probability_percent}% Score)
            </div>
          `, { permanent: true, direction: 'center' });
        }

        group.addLayer(polygon);
      });
    }
  }, [analysisData, knownDeposits, selectedZone]);

  const topDistrict = stateAnalysis?.top_district;

  return (
    <div className="space-y-4">

      <div className="relative w-full h-[650px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        
        <div ref={mapRef} className="w-full h-full z-0 cursor-pointer" />

        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-slate-900/90 backdrop-blur-md border border-amber-500/50 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center space-x-2">
          <MapPin className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>
            {isAnalyzing
              ? `Analyzing ${stateAnalysis?.state_name || ''} Prospectivity Zones...`
              : `Active State: ${stateAnalysis?.state_name || 'India'} (Click anywhere on map to select place!)`}
          </span>
        </div>

        {topDistrict && !dismissTopBanner && (
          <div className="absolute top-3 right-3 z-10 max-w-sm bg-gradient-to-r from-slate-900/95 via-slate-900/95 to-amber-950/90 backdrop-blur-md border border-amber-500/50 rounded-xl p-3.5 shadow-2xl space-y-1 text-xs text-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Top Candidate Exploration Area</span>
              </div>
              <button
                onClick={() => setDismissTopBanner(true)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-sm font-bold text-white leading-tight">
              {topDistrict.district_name}
            </p>
            <p className="text-[11px] text-amber-200 font-semibold">
              {topDistrict.key_driver}
            </p>
          </div>
        )}

        {/* PROSPECTIVITY LEGEND */}
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl px-3.5 py-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-300 shadow-xl">
          <span className="font-semibold text-slate-400">Prospectivity Legend:</span>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block"></span>
            <span>High Prospectivity</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange-500 inline-block"></span>
            <span>Medium-High</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>
            <span>Medium</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block"></span>
            <span>Low Prospectivity</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            <span>Ground-Truth Occurrence</span>
          </div>
        </div>

      </div>

    </div>
  );
}
