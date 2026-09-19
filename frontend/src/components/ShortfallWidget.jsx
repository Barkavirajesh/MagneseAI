import React from 'react';
import { TrendingUp, AlertTriangle, BatteryCharging, DollarSign, PieChart, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function ShortfallWidget({ shortfallData }) {
  if (!shortfallData) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-full uppercase tracking-wider">
              Market Alert
            </span>
            <span className="text-xs text-slate-400 font-mono">USGS & World Bank Data</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span>Manganese Reserve & Supply Shortfall Forecast</span>
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Ore Price (44% Mn)</div>
            <div className="text-base font-bold text-amber-400 font-mono">${shortfallData.current_price_usd_per_tonne} / Tonne</div>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Battery HPMSM Price</div>
            <div className="text-base font-bold text-emerald-400 font-mono">${shortfallData.hpmsm_battery_grade_price_usd_per_tonne} / Tonne</div>
          </div>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: 2030 Deficit */}
        <div className="bg-gradient-to-br from-rose-950/40 via-slate-950 to-slate-950 border border-rose-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span>Projected 2030 Deficit</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono">
            -{shortfallData.projected_deficit_by_2030_pct}%
          </div>
          <p className="text-[11px] text-slate-400">
            Supply gap between global mined production and battery-grade demand by 2030.
          </p>
        </div>

        {/* Card 2: EV Battery CAGR */}
        <div className="bg-gradient-to-br from-amber-950/40 via-slate-950 to-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>EV Battery Demand CAGR</span>
            <BatteryCharging className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {shortfallData.ev_battery_demand_growth_cagr}
          </div>
          <p className="text-[11px] text-slate-400">
            Annual growth rate for High-Purity Manganese Sulphate Monohydrate in NMC / LMFP batteries.
          </p>
        </div>

        {/* Card 3: Global Annual Ore Demand */}
        <div className="bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span>Global Annual Ore Demand</span>
            <PieChart className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-300 font-mono">
            21.5M <span className="text-xs text-slate-400">Tonnes</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Total metallurgical and chemical manganese ore consumption worldwide.
          </p>
        </div>

      </div>

      {/* Country Supply Distribution & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Global Supply Share */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>Global Mine Production Share</span>
          </h3>

          <div className="space-y-2.5">
            {shortfallData.supply_by_country?.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{item.country}</span>
                  <span className="text-amber-400 font-mono font-bold">{item.share_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${item.share_pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Insights & AI Discovery Role */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Strategic Strategic Exploration Role</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-300">
            {shortfallData.key_insights?.map((insight, i) => (
              <li key={i} className="flex items-start space-x-2.5 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

    </div>
  );
}
