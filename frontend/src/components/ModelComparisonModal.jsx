import React, { useEffect, useState } from 'react';
import { fetchModelBenchmarks } from '../services/api';
import { BarChart3, ShieldCheck, Cpu, Layers } from 'lucide-react';

export default function ModelComparisonModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchModelBenchmarks()
        .then((res) => {
          setData(res.benchmarks);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const lr = data?.logistic_regression || {};
  const rf = data?.random_forest || {};
  const gb = data?.gradient_boosting || {};

  const renderModelCard = (modelData, title, badge, badgeColor, titleColor) => {
    const cm = modelData?.confusion_matrix || [[0, 0], [0, 0]];
    const tn = cm[0]?.[0] || 0;
    const fp = cm[0]?.[1] || 0;
    const fn = cm[1]?.[0] || 0;
    const tp = cm[1]?.[1] || 0;

    return (
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-3 flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex justify-between items-center border-b border-slate-700/80 pb-2.5">
            <span className={`font-bold text-sm ${titleColor}`}>{title}</span>
            <span className={`text-[10px] ${badgeColor} px-2 py-0.5 rounded font-mono font-semibold`}>
              {badge}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs mt-3">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">PR-AUC</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {((modelData?.pr_auc || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ROC-AUC</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono">
                {((modelData?.roc_auc || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">F1-Score</span>
              <span className="text-sm font-bold text-teal-300 font-mono">
                {((modelData?.f1_score || 0) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Precision / Recall</span>
              <span className="text-xs font-semibold text-slate-200 font-mono">
                {((modelData?.precision || 0) * 100).toFixed(0)}% / {((modelData?.recall || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Confusion Matrix Mini Grid */}
          <div className="mt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Confusion Matrix (Spatial GroupKFold):
            </span>
            <div className="grid grid-cols-2 gap-1 text-center text-[10px] font-mono">
              <div className="bg-emerald-950/60 border border-emerald-500/30 p-1 rounded text-emerald-300">
                TN: {tn}
              </div>
              <div className="bg-rose-950/60 border border-rose-500/30 p-1 rounded text-rose-300">
                FP: {fp}
              </div>
              <div className="bg-amber-950/60 border border-amber-500/30 p-1 rounded text-amber-300">
                FN: {fn}
              </div>
              <div className="bg-emerald-950/60 border border-emerald-500/30 p-1 rounded text-emerald-300">
                TP: {tp}
              </div>
            </div>
          </div>
        </div>

        {/* Top Feature Importances */}
        <div className="pt-2 border-t border-slate-700/60">
          <span className="text-[10px] font-semibold text-slate-400 block mb-1">Top Features:</span>
          <div className="space-y-1">
            {modelData?.feature_importances &&
              Object.entries(modelData.feature_importances)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([feat, val]) => (
                  <div key={feat} className="flex justify-between text-[10px]">
                    <span className="text-slate-300 truncate max-w-[130px] font-mono">{feat}</span>
                    <span className="font-mono font-bold text-amber-400">{(val * 100).toFixed(1)}%</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-5xl w-full p-6 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent flex items-center gap-2">
                📊 ML Spatial Validation & Benchmark Suite
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                5-Fold Spatial GroupKFold Cross-Validation across 10 Indian Mining Belts (Zero Spatial Data Leakage)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-2">
          {loading && (
            <div className="text-center py-12 text-amber-400 animate-pulse font-medium">
              Evaluating Spatial GroupKFold Cross-Validation Benchmarks...
            </div>
          )}

          {error && (
            <div className="bg-rose-950/60 border border-rose-500 text-rose-300 p-4 rounded-xl text-sm">
              Error fetching model benchmarks: {error}
            </div>
          )}

          {data && (
            <>
              {/* 3 Side-by-Side Model Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderModelCard(lr, "Logistic Regression", "L2 Baseline", "bg-slate-700 text-slate-300", "text-slate-200")}
                {renderModelCard(rf, "Random Forest Classifier", "Primary Ensemble", "bg-emerald-500/20 text-emerald-300", "text-emerald-400")}
                {renderModelCard(gb, "Gradient Boosting (XGBoost)", "High Precision", "bg-teal-500/20 text-teal-300", "text-teal-300")}
              </div>

              {/* Ore Grade Regressor RMSE Banner */}
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-amber-400 block text-sm">
                    ⚡ Ore Grade Estimation Regressor (% Mn Grade)
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Gradient Boosting Regressor calibrated on USGS MRDS & GSI ore body chemical assays
                  </p>
                </div>
                <div className="text-right bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/40">
                  <span className="text-slate-400 text-[10px] block font-mono uppercase">Spatial Test RMSE</span>
                  <span className="font-mono font-extrabold text-amber-400 text-base">±{data.ore_grade_regressor_rmse}% Mn</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg shadow-lg transition cursor-pointer"
          >
            Close Benchmark Suite
          </button>
        </div>
      </div>
    </div>
  );
}
