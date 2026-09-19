import React from 'react';
import { Layers, Activity, TrendingUp, Cpu, Radio, Sparkles, Database } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAnalyzing, onOpenProvenanceModal }) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-amber-400 via-amber-200 to-slate-100 bg-clip-text text-transparent">
                  ManganeseAI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full uppercase tracking-wider">
                  Prospectivity v2.1
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Manganese Mineral Prospectivity Mapping System for India
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Map Explorer</span>
            </button>

            <button
              onClick={() => setActiveTab('samples')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'samples'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Famous Belts</span>
            </button>

            <button
              onClick={() => setActiveTab('market')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'market'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Market & Supply</span>
            </button>
          </nav>

          {/* Live System & Provenance Badges */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <button
              onClick={onOpenProvenanceModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-lg transition-all cursor-pointer font-bold"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>12 Datasets Catalog</span>
            </button>

            <a
              href="https://dataspace.copernicus.eu/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all"
            >
              <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
              <span className="font-mono text-[11px]">Copernicus S2 L2A STAC</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
