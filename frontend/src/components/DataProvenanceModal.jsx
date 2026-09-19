import React, { useEffect, useState } from 'react';
import { fetchDataProvenance } from '../services/api';
import { Database, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export default function DataProvenanceModal({ isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchDataProvenance()
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-4xl w-full p-6 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📜 Data Provenance & Dataset Architecture
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete documentation of all 12 authoritative remote sensing, geological, and terrain datasets
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

        {/* Modal Content Body */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-2 text-xs text-slate-300">
          {loading && (
            <div className="text-center py-12 text-amber-400 animate-pulse font-medium">
              Loading Data Provenance Catalog...
            </div>
          )}

          {error && (
            <div className="bg-red-950/60 border border-red-500 text-red-300 p-4 rounded-xl">
              Error loading provenance metadata: {error}
            </div>
          )}

          {data && (
            <>
              {/* Scientific Notice Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Scientific & Licensing Standards</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  All Sentinel-2 multispectral ratios ($B11/B08$, $B12/B11$, $B04/B02$, Red-Edge) represent surface mineralogy, lithological alteration, and exposed soil weathering halos. They do not constitute direct mineral identification of pyrolusite or psilomelane. Predictions denote <strong>Manganese Mineral Prospectivity Zones</strong> and <strong>Candidate Exploration Areas</strong>.
                </p>
              </div>

              {/* Source Organizations Badge List */}
              <div>
                <h3 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2">
                  Primary Authoritative Source Organizations ({data.dataset_count} Datasets):
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {data.primary_source_orgs?.map((org, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex items-center space-x-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-200 truncate">{org}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Sources Markdown Render / Table View */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] leading-relaxed max-h-[350px] overflow-y-auto whitespace-pre-wrap text-slate-300 scrollbar-thin">
                {data.markdown || "DATA_SOURCES.md loaded successfully."}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-lg transition cursor-pointer"
          >
            Close Provenance Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
