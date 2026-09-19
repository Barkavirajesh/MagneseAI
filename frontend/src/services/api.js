const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchKnownDeposits() {
  const resp = await fetch(`${API_BASE_URL}/known-deposits`);
  if (!resp.ok) throw new Error('Failed to fetch known deposits');
  return resp.json();
}

export async function fetchIndiaStates() {
  const resp = await fetch(`${API_BASE_URL}/india-states`);
  if (!resp.ok) throw new Error('Failed to fetch Indian states');
  return resp.json();
}

export async function fetchSampleRegions() {
  const resp = await fetch(`${API_BASE_URL}/sample-regions`);
  if (!resp.ok) throw new Error('Failed to fetch sample regions');
  return resp.json();
}

export async function fetchMarketShortfall() {
  const resp = await fetch(`${API_BASE_URL}/market-shortfall`);
  if (!resp.ok) throw new Error('Failed to fetch market shortfall data');
  return resp.json();
}

export async function fetchModelBenchmarks() {
  const resp = await fetch(`${API_BASE_URL}/model-benchmarks`);
  if (!resp.ok) throw new Error('Failed to fetch model benchmarks');
  return resp.json();
}

export async function fetchDataProvenance() {
  const resp = await fetch(`${API_BASE_URL}/data-provenance`);
  if (!resp.ok) throw new Error('Failed to fetch data provenance metadata');
  return resp.json();
}

export async function analyzeState(stateId, gridSize = 5, modelType = 'rf') {
  const resp = await fetch(`${API_BASE_URL}/analyze-state`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      state_id: stateId,
      grid_size: parseInt(gridSize),
      model_type: modelType,
    }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to analyze Indian state');
  }

  return resp.json();
}

export async function analyzeRegion(bbox, gridSize = 5, modelType = 'rf') {
  const resp = await fetch(`${API_BASE_URL}/analyze-region`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      min_lat: parseFloat(bbox.min_lat),
      min_lng: parseFloat(bbox.min_lng),
      max_lat: parseFloat(bbox.max_lat),
      max_lng: parseFloat(bbox.max_lng),
      grid_size: parseInt(gridSize),
      model_type: modelType,
    }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to process region analysis');
  }

  return resp.json();
}
