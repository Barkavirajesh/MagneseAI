import React from 'react';
import { Award, Zap, Mountain, Compass, MapPin, Activity, CheckCircle2, ChevronRight, Info, ShieldCheck } from 'lucide-react';

export default function ZoneDetailSidebar({ selectedZone, topZone, onClose }) {
  if (!selectedZone) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 shadow-xl">
        <Compass className="w-10 h-10 text-slate-600 mx-auto mb-3 animate-spin-slow" />
        <h3 className="text-sm font-semibold text-slate-200 mb-1">No Sub-Zone Selected</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Click on any grid sub-zone on the map to inspect multi-spectral 10-band reflectance, lithology, structural fault distance, and prospectivity signals.
        </p>
      </div>
    );
  }

  const isTopZone = topZone && topZone.cell_id === selectedZone.cell_id;
  const prob = selectedZone.probability_percent;
  const signals = selectedZone.signals || {};
  const bands = selectedZone.bands || {};

  const getBadgeStyle = () => {
    if (prob >= 75) return 'bg-red-500/20 text-red-400 border-red-500/40';
    if (prob >= 50) return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    if (prob >= 30) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  };

  const getProgressColor = () => {
    if (prob >= 75) return 'bg-gradient-to-r from-orange-500 to-red-500';
    if (prob >= 50) return 'bg-gradient-to-r from-amber-500 to-orange-500';
    if (prob >= 30) return 'bg-gradient-to-r from-yellow-500 to-amber-500';
    return 'bg-gradient-to-r from-emerald-500 to-teal-500';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5 text-slate-100 max-h-[85vh] overflow-y-auto">
      
      {/* Top Banner if Top Zone */}
      {isTopZone && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 rounded-xl p-3.5 flex items-start space-x-3 shadow-lg shadow-amber-500/10">
          <Award className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              ⭐ Top Candidate Exploration Area
            </span>
            <p className="text-xs font-semibold text-amber-200 mt-0.5">
              {selectedZone.cell_id}: {prob}% Prospectivity Score — Highest in Selection
            </p>
          </div>
        </div>
      )}

      {/* Header & Sub-zone ID */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Sub-Zone Analysis</span>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>{selectedZone.cell_id}</span>
          </h2>
          <span className="text-[11px] text-teal-400 font-mono block mt-0.5">
            Model: {selectedZone.model_used || 'Random Forest Classifier'}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getBadgeStyle()}`}>
            {prob}% Score
          </span>
          {selectedZone.estimated_grade_mn_pct > 0 && (
            <span className="text-[11px] font-mono text-amber-400 font-bold">
              ~{selectedZone.estimated_grade_mn_pct}% Mn Grade
            </span>
          )}
        </div>
      </div>

      {/* K-Means Unsupervised Cluster Badge */}
      {selectedZone.cluster_label && (
        <div className="bg-gradient-to-r from-slate-950 to-slate-900 border border-teal-500/30 rounded-xl p-3 space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-teal-400 font-bold">K-Means Spectral Cluster</span>
            <span className="text-emerald-400 font-bold font-mono text-[11px]">
              {selectedZone.jamda_koira_similarity_pct || 75.0}% Jamda-Koira Match
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-200">
            {selectedZone.cluster_label}
          </p>
        </div>
      )}

      {/* Prospectivity Bar */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Manganese Mineral Prospectivity</span>
          <span className="font-bold text-white">{prob}%</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getProgressColor()}`}
            style={{ width: `${Math.max(5, prob)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Zone Classification: <strong className="text-slate-200">{selectedZone.category}</strong>
        </p>
      </div>

      {/* Scene Classification Filter */}
      {signals.scene_classification && (
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">SCL Surface Filter:</span>
          <span className="font-mono text-emerald-400 font-bold text-[11px]">{signals.scene_classification}</span>
        </div>
      )}

      {/* Coordinates Bounds */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center space-x-2 text-slate-400 font-semibold mb-1">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>Bounding Box Center</span>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-300">
          <div>Lat: <span className="text-white">{selectedZone.center?.latitude}</span></div>
          <div>Lng: <span className="text-white">{selectedZone.center?.longitude}</span></div>
        </div>
      </div>

      {/* Multi-Spectral & Geological Signals */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Multi-Spectral & Geological Signals</span>
        </h3>

        <div className="grid grid-cols-1 gap-2 text-xs">
          
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/70 flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-200">GSI Lithological Unit</div>
              <p className="text-[10px] text-slate-400">{signals.lithology_name || "Gondite Metasediments"}</p>
            </div>
            <span className="font-mono font-bold text-amber-400 text-xs">Paleoproterozoic</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/70 flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-200">Structural Lineament / Fault</div>
              <p className="text-[10px] text-slate-400">Fault dist: {signals.fault_distance_km || 1.2} km</p>
            </div>
            <span className="font-mono font-bold text-teal-300 text-xs">{signals.lineament_density || 1.8} lineaments/km²</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/70 flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-200">SWIR1 / NIR Ratio (B11/B08)</div>
              <p className="text-[10px] text-slate-400">Surface alteration & weathering halo</p>
            </div>
            <span className="font-mono font-bold text-amber-400 text-sm">{signals.swir1_nir_ratio}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/70 flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-200">Ferric Iron Index (B04/B02)</div>
              <p className="text-[10px] text-slate-400">Red to Blue reflectance ratio</p>
            </div>
            <span className="font-mono font-bold text-amber-300 text-sm">{signals.ferric_iron_ratio}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/70 flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-200">Nearest Ground-Truth Occurrence</div>
              <p className="text-[10px] text-slate-400">{signals.nearest_deposit_name} ({signals.deposit_type})</p>
            </div>
            <span className="font-mono font-bold text-indigo-400 text-sm">{signals.dist_to_known_deposit_km} km</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/70 flex justify-between items-center">
            <div>
              <div className="font-semibold text-slate-200">SRTM Elevation & Slope</div>
              <p className="text-[10px] text-slate-400">Terrain elevation and slope gradient</p>
            </div>
            <div className="text-right font-mono text-xs text-emerald-400">
              <div>{signals.elevation_meters}m elev</div>
              <div className="text-[11px] text-slate-400">{signals.slope_degrees}° slope</div>
            </div>
          </div>

        </div>
      </div>

      {/* Raw 10 Sentinel-2 Spectral Reflectance Bands */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Sentinel-2 10-Band Surface Reflectance</span>
          <span className="text-[10px] text-slate-500 font-mono">10m-20m Resolution</span>
        </h4>
        <div className="grid grid-cols-4 gap-1.5 font-mono text-[10px] text-center">
          <div className="bg-slate-900 p-1 rounded border border-slate-800">
            <span className="text-slate-400 block text-[9px]">B02 (Blue)</span>
            <span className="text-sky-300 font-semibold">{bands.B02_Blue || 0.08}</span>
          </div>
          <div className="bg-slate-900 p-1 rounded border border-slate-800">
            <span className="text-slate-400 block text-[9px]">B03 (Green)</span>
            <span className="text-emerald-300 font-semibold">{bands.B03_Green || 0.10}</span>
          </div>
          <div className="bg-slate-900 p-1 rounded border border-slate-800">
            <span className="text-slate-400 block text-[9px]">B04 (Red)</span>
            <span className="text-rose-400 font-semibold">{bands.B04_Red || 0.12}</span>
          </div>
          <div className="bg-slate-900 p-1 rounded border border-slate-800">
            <span className="text-slate-400 block text-[9px]">B05 (RE1)</span>
            <span className="text-red-300 font-semibold">{bands.B05_RedEdge1 || 0.15}</span>
          </div>
          <div className="bg-slate-900 p-1 rounded border border-slate-800">
            <span className="text-slate-400 block text-[9px]">B06 (RE2)</span>
            <span className="text-orange-300 font-semibold">{bands.B06_RedEdge2 || 0.18}</span>
          </div>
          <div className="bg-slate-900 p-1 rounded border border-slate-800">
            <span className="text-slate-400 block text-[9px]">B07 (RE3)</span>
            <span className="text-amber-300 font-semibold">{bands.B07_RedEdge3 || 0.20}</span>
          </div>
          <div className="bg-slate-900 p-1 rounded border border-slate-800">
            <span className="text-slate-400 block text-[9px]">B08 (NIR)</span>
            <span className="text-emerald-400 font-semibold">{bands.B08_NIR || 0.22}</span>
          </div>
          <div className="bg-slate-900 p-1 rounded border border-slate-800">
            <span className="text-slate-400 block text-[9px]">B11 (SWIR1)</span>
            <span className="text-amber-400 font-semibold">{bands.B11_SWIR1 || 0.25}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
