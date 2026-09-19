import React from 'react';
import { Cpu, BarChart3 } from 'lucide-react';

export default function StateSelectorHeader({
  states,
  selectedStateId,
  onSelectState,
  isAnalyzingState,
  modelType,
  onModelTypeChange,
  onOpenModelModal
}) {
  if (!states || states.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Title & State Select Dropdown + Model Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🇮🇳</span>
            <h2 className="text-lg font-bold text-white tracking-wide">
              AI Manganese Mineral Prospectivity Engine (Indian States)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Analyze district prospectivity zones using multi-spectral satellite imagery and spatial ML models.
          </p>
        </div>

        {/* ML Model Selector & Benchmark Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
            <label className="text-xs font-semibold text-slate-300">ML Model:</label>
            <select
              value={modelType}
              onChange={(e) => onModelTypeChange(e.target.value)}
              className="bg-slate-900 text-emerald-400 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer border border-emerald-500/40 hover:border-emerald-400 transition"
            >
              <option value="rf">Random Forest Classifier</option>
              <option value="gbm">Gradient Boosting (XGBoost)</option>
              <option value="lr">Logistic Regression (L2 Baseline)</option>
            </select>
          </div>

          <button
            onClick={onOpenModelModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Spatial CV Benchmarks</span>
          </button>

          {/* State Dropdown */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/40 shadow-inner">
            <label className="text-xs font-bold text-slate-300 whitespace-nowrap">State:</label>
            <select
              value={selectedStateId}
              onChange={(e) => onSelectState(e.target.value)}
              className="bg-slate-900 text-amber-400 text-xs font-extrabold rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer border border-amber-500/50 hover:border-amber-400 transition"
            >
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Rank #{s.manganese_reserve_rank} — {s.national_share_pct}%)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Select State Buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Select Indian State:
          </span>
          {isAnalyzingState && (
            <span className="text-xs font-semibold text-amber-400 animate-pulse flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping"></span>
              Running Spatial Prospectivity Models...
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
          {states.map((s) => {
            const isActive = s.id === selectedStateId;
            return (
              <button
                key={s.id}
                onClick={() => onSelectState(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400 scale-105'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/50 hover:text-white'
                }`}
              >
                <span className="text-sm">📍</span>
                <span>{s.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-slate-950/40 text-slate-950 font-extrabold' : 'bg-slate-900 text-slate-400'
                }`}>
                  #{s.manganese_reserve_rank}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
