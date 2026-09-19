import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapView from './components/MapView';
import ZoneDetailSidebar from './components/ZoneDetailSidebar';
import SampleRegions from './components/SampleRegions';
import ShortfallWidget from './components/ShortfallWidget';
import StateSelectorHeader from './components/StateSelectorHeader';
import DistrictRankingsPanel from './components/DistrictRankingsPanel';
import ModelComparisonModal from './components/ModelComparisonModal';
import DataProvenanceModal from './components/DataProvenanceModal';

import {
  fetchKnownDeposits,
  fetchSampleRegions,
  fetchMarketShortfall,
  fetchIndiaStates,
  analyzeState,
  analyzeRegion
} from './services/api';

import { AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [knownDeposits, setKnownDeposits] = useState([]);
  const [sampleRegions, setSampleRegions] = useState([]);
  const [marketShortfall, setMarketShortfall] = useState(null);
  const [indiaStates, setIndiaStates] = useState([]);

  // AI Model Selection & Benchmark Modals
  const [modelType, setModelType] = useState('rf');
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isProvenanceModalOpen, setIsProvenanceModalOpen] = useState(false);

  // State & District Analysis State
  const [selectedStateId, setSelectedStateId] = useState('');
  const [stateAnalysis, setStateAnalysis] = useState(null);
  const [isAnalyzingState, setIsAnalyzingState] = useState(false);

  // Region / Grid Analysis State
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedBbox, setSelectedBbox] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Initial Data Fetching on mount
  useEffect(() => {
    async function initData() {
      try {
        const depositsRes = await fetchKnownDeposits();
        setKnownDeposits(depositsRes.deposits || []);

        const statesRes = await fetchIndiaStates();
        setIndiaStates(statesRes.states || []);

        const regionsRes = await fetchSampleRegions();
        setSampleRegions(regionsRes || []);

        const marketRes = await fetchMarketShortfall();
        setMarketShortfall(marketRes || null);
      } catch (err) {
        console.error('Initialization error:', err);
        setErrorMsg('Failed to initialize API services. Ensure FastAPI server is running at http://localhost:8000.');
      }
    }
    initData();
  }, []);

  // Handle State Selection -> Triggers District AI Analysis across that state!
  const handleSelectState = async (stateId, overrideModelType) => {
    const targetModel = overrideModelType || modelType;
    setSelectedStateId(stateId);
    setIsAnalyzingState(true);
    setErrorMsg(null);

    try {
      const stateRes = await analyzeState(stateId, 5, targetModel);
      setStateAnalysis(stateRes);

      if (stateRes.grid_analysis) {
        setAnalysisData(stateRes.grid_analysis);
        setSelectedBbox(stateRes.grid_analysis.bounding_box);

        if (stateRes.grid_analysis.top_zone && stateRes.grid_analysis.grid_cells) {
          const topCell = stateRes.grid_analysis.grid_cells.find(c => c.cell_id === stateRes.grid_analysis.top_zone.cell_id);
          if (topCell) setSelectedZone(topCell);
        }
      }
    } catch (err) {
      console.error('State analysis error:', err);
      setErrorMsg(err.message || 'An error occurred during state district analysis.');
    } finally {
      setIsAnalyzingState(false);
    }
  };

  // Handle Changing AI Model Toggle
  const handleModelTypeChange = (newModel) => {
    setModelType(newModel);
    handleSelectState(selectedStateId, newModel);
  };

  // Handle Clicking a specific District from the District Rankings Panel
  const handleSelectDistrict = (district) => {
    if (district.bbox) {
      setSelectedBbox(district.bbox);
      handleRunAnalysis(district.bbox, 5);
    }
  };

  const handleRunAnalysis = async (bbox, gridSize = 5) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const data = await analyzeRegion(bbox, gridSize);
      setAnalysisData(data);
      setSelectedBbox(bbox);

      if (data.top_zone && data.grid_cells) {
        const topCell = data.grid_cells.find(c => c.cell_id === data.top_zone.cell_id);
        if (topCell) setSelectedZone(topCell);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'An error occurred during satellite analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSampleRegion = (sample) => {
    setSelectedBbox(sample.bbox);
    setActiveTab('map');
    handleRunAnalysis(sample.bbox, 5);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAnalyzing={isAnalyzing || isAnalyzingState}
        onOpenProvenanceModal={() => setIsProvenanceModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error Alert Notification */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-slate-400 hover:text-slate-200 text-xs font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Interactive Map Explorer */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            
            {/* STATE SELECTOR HEADER */}
            <StateSelectorHeader
              states={indiaStates}
              selectedStateId={selectedStateId}
              onSelectState={handleSelectState}
              isAnalyzingState={isAnalyzingState}
              modelType={modelType}
              onModelTypeChange={handleModelTypeChange}
              onOpenModelModal={() => setIsModelModalOpen(true)}
            />

            {/* Map & District Rankings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Map Column (2 Spans) */}
              <div className="lg:col-span-2 space-y-6">
                <MapView
                  knownDeposits={knownDeposits}
                  analysisData={analysisData}
                  stateAnalysis={stateAnalysis}
                  selectedStateId={selectedStateId}
                  onSelectState={handleSelectState}
                  isAnalyzing={isAnalyzing || isAnalyzingState}
                  onAnalyze={handleRunAnalysis}
                  selectedZone={selectedZone}
                  setSelectedZone={setSelectedZone}
                  selectedBbox={selectedBbox}
                  setSelectedBbox={setSelectedBbox}
                />
              </div>

              {/* District Rankings & Sub-Zone Sidebar Column (1 Span) */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* District Rankings Panel */}
                <DistrictRankingsPanel
                  stateAnalysis={stateAnalysis}
                  onSelectDistrict={handleSelectDistrict}
                />

                {/* Sub-Zone Detail Sidebar */}
                <ZoneDetailSidebar
                  selectedZone={selectedZone}
                  topZone={analysisData?.top_zone}
                  onClose={() => setSelectedZone(null)}
                />

              </div>

            </div>

          </div>
        )}

        {/* Spatial ML Benchmark Comparison Modal */}
        <ModelComparisonModal
          isOpen={isModelModalOpen}
          onClose={() => setIsModelModalOpen(false)}
        />

        {/* Data Provenance & Catalog Modal */}
        <DataProvenanceModal
          isOpen={isProvenanceModalOpen}
          onClose={() => setIsProvenanceModalOpen(false)}
        />

        {/* Tab 2: Sample Famous Regions */}
        {activeTab === 'samples' && (
          <SampleRegions
            sampleRegions={sampleRegions}
            onSelectRegion={handleSelectSampleRegion}
          />
        )}

        {/* Tab 3: Market & Supply Shortfall Forecast */}
        {activeTab === 'market' && (
          <ShortfallWidget shortfallData={marketShortfall} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-2 sm:space-y-0">
          <div>
            <span>ManganeseAI &copy; 2026</span> • <span>Powered by Sentinel-2 L2A 10-Band STAC & Spatial GroupKFold ML</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsProvenanceModalOpen(true)} className="hover:text-amber-400 transition-colors font-semibold">
              DATA_SOURCES.md Provenance
            </button>
            <span className="hover:text-slate-400 transition-colors">GSI & USGS Data</span>
            <span className="hover:text-slate-400 transition-colors">NASA SRTM DEM</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
