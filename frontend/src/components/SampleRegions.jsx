import React from 'react';
import { Globe, ArrowRight, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

export default function SampleRegions({ sampleRegions, onSelectRegion }) {
  if (!sampleRegions || sampleRegions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Globe className="w-5 h-5 text-amber-400" />
            <span>Preset Famous Manganese Mining Districts</span>
          </h2>
          <p className="text-xs text-slate-400">
            Select any world-class manganese deposit region to automatically fetch live Sentinel-2 satellite data and run AI analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sampleRegions.map((region) => (
          <div
            key={region.id}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {region.region}
                </span>
                <MapPin className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {region.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                  {region.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectRegion(region)}
              className="mt-5 w-full py-2.5 px-4 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-md"
            >
              <span>Analyze Region</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
