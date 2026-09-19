import React from 'react';
import { Award, Zap, ChevronRight, MapPin, Compass, ShieldCheck } from 'lucide-react';

export default function DistrictRankingsPanel({ stateAnalysis, onSelectDistrict }) {
  if (!stateAnalysis || !stateAnalysis.districts_ranking) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-300 space-y-3 shadow-xl">
        <div className="text-4xl">🇮🇳</div>
        <h3 className="text-base font-bold text-white">No State Selected</h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Select any Indian State from the quick select buttons or click anywhere on the map to run District Prospectivity AI Analysis.
        </p>
      </div>
    );
  }

  const topDist = stateAnalysis.top_district;
  const districts = stateAnalysis.districts_ranking;

  const handleExportCSV = () => {
    const headers = [
      'District Name',
      'State',
      'Prospectivity Score (%)',
      'Estimated Ore Grade (% Mn)',
      'K-Means Cluster Signature',
      'Jamda-Koira Similarity (%)',
      'Nearest Ground-Truth Occurrence',
      'Distance to Deposit (km)'
    ];

    const rows = districts.map((d) => [
      `"${d.district_name}"`,
      `"${stateAnalysis.state_name}"`,
      d.probability_percent,
      d.estimated_grade_mn_pct,
      `"${d.cluster_label || 'Gondite Belt Signature'}"`,
      d.jamda_koira_similarity_pct || 75.0,
      `"${d.signals?.nearest_deposit_name || 'GSI Deposit Site'}"`,
      d.signals?.dist_to_known_deposit_km || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${stateAnalysis.state_name.toLowerCase()}_manganese_prospectivity_ranking.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      
      {/* State Header & National Reserve Share */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            State Mineral Prospectivity Mapping
          </span>
          <h2 className="text-lg font-bold text-white mt-1">
            {stateAnalysis.state_name} District Rankings
          </h2>
        </div>
        <div className="text-right">
          <button
            onClick={handleExportCSV}
            className="mb-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
          >
            📥 Export CSV Report
          </button>
          <div className="text-amber-400 font-bold font-mono text-[11px]">Rank #{stateAnalysis.manganese_reserve_rank} in India</div>
          <div className="text-slate-400 text-[10px]">{stateAnalysis.national_share_pct}% National Reserves</div>
        </div>
      </div>

      {/* Top District Highlight Banner */}
      {topDist && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 rounded-xl p-3.5 shadow-lg shadow-amber-500/10 flex items-start space-x-3">
          <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              ⭐ Top Candidate Exploration Area
            </span>
            <p className="text-xs font-bold text-white mt-0.5">
              {topDist.district_name}
            </p>
            <p className="text-[11px] text-amber-200 mt-0.5">
              {topDist.key_driver}
            </p>
          </div>
        </div>
      )}

      {/* District Rankings List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          District Analysis Results ({districts.length} Districts)
        </h3>

        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {districts.map((dist, idx) => {
            const isTop = idx === 0;
            const prob = dist.probability_percent;
            const grade = dist.estimated_grade_mn_pct;

            let badgeStyle = 'bg-slate-900 text-slate-400 border-slate-700';
            let statusText = 'Low Prospectivity Zone';
            let statusColor = 'text-slate-400';

            if (prob >= 75) {
              badgeStyle = 'bg-red-500/20 text-red-300 border-red-500/40';
              statusText = '🔴 High Prospectivity Zone';
              statusColor = 'text-red-400';
            } else if (prob >= 50) {
              badgeStyle = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
              statusText = '🟠 Medium-High Prospectivity Zone';
              statusColor = 'text-orange-400';
            } else if (prob >= 30) {
              badgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
              statusText = '🟡 Medium Prospectivity Zone';
              statusColor = 'text-amber-400';
            }

            return (
              <div
                key={dist.district_id}
                onClick={() => onSelectDistrict(dist)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 group ${
                  isTop
                    ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold font-mono text-slate-500">#{idx + 1}</span>
                    <span className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {dist.district_name}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${badgeStyle}`}>
                    {prob}% Prospectivity
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-900">
                  <div className={`font-semibold ${statusColor} flex items-center gap-1 text-[11px]`}>
                    <span>{statusText}</span>
                  </div>
                  {grade > 0 ? (
                    <span className="font-mono text-amber-400 font-bold text-[11px]">
                      ~{grade}% Mn Grade
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[10px] font-mono">Unrated Grade</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
