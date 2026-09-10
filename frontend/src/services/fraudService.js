// ============================================================
// src/services/fraudService.js
// RINGFINDER — REAL DJANGO REST FRAUD SERVICE
// ============================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000/api';

// ============================================================
// COMMON HELPERS
// ============================================================

const getToken = () => {
  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');

  return token;
};

const buildHeaders = (isJson = true) => {
  const headers = {};

  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const request = async (
  endpoint,
  {
    method = 'GET',
    body,
    query,
    isFormData = false,
  } = {}
) => {
  let url = `${API_BASE_URL}${endpoint}`;

  if (query && typeof query === 'object') {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        value !== 'ALL'
      ) {
        params.append(key, value);
      }
    });

    const queryString = params.toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const options = {
    method,
    headers: buildHeaders(!isFormData),
  };

  if (body !== undefined) {
    options.body = isFormData
      ? body
      : JSON.stringify(body);
  }

  const response = await fetch(url, options);

  let data = null;

  const contentType =
    response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text || null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      `Backend API returned ${response.status}`;

    throw new Error(message);
  }

  return data;
};

const unwrap = (response, keys = []) => {
  if (!response || typeof response !== 'object') {
    return response;
  }

  for (const key of keys) {
    if (response[key] !== undefined) {
      return response[key];
    }
  }

  return response;
};

const asArray = (response, keys = []) => {
  const value = unwrap(response, keys);

  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

// ============================================================
// DASHBOARD
// ============================================================

const getDashboardStats = async () => {
  const response = await request('/fraud/dashboard-stats/');
  return unwrap(response, ['data', 'result', 'summary']);
};

// ============================================================
// TRANSACTIONS
// ============================================================

const getTransactions = async (filter = {}) => {
  const response = await request('/transactions/', {
    method: 'GET',
    query: {
      risk_level:
        filter.riskLevel &&
        filter.riskLevel !== 'ALL'
          ? filter.riskLevel
          : undefined,

      search:
        filter.search || undefined,
    },
  });

  return asArray(response, [
    'data',
    'results',
    'transactions',
  ]);
};

// ============================================================
// TRANSACTION NETWORK
// ============================================================

const getNetworkData = async () => {
  const response = await request(
    '/fraud/network/',
    {
      method: 'GET',
    }
  );

  const payload = unwrap(response, ['data']);

  const nodes = Array.isArray(payload?.nodes)
    ? payload.nodes
    : [];

  const edges = Array.isArray(payload?.edges)
    ? payload.edges
    : [];

  return {
    nodes,
    edges,

    stats: {
      nodes: nodes.length,
      edges: edges.length,

      transactions:
        payload?.stats?.transactions ??
        payload?.stats?.transaction_count ??
        edges.length,

      totalVolume:
        Number(
          payload?.stats?.totalVolume ??
            payload?.stats?.total_volume ??
            0
        ) || 0,
    },

    source:
      payload?.source ||
      'DJANGO_FRAUD_NETWORK_API',

    generatedAt:
      payload?.generatedAt ||
      payload?.generated_at ||
      new Date().toISOString(),
  };
};

// ============================================================
// FRAUD DETECTION / ANALYSIS
// ============================================================

const runDetection = async (
  datasetId = null
) => {
  const body = datasetId
    ? {
        dataset_id: datasetId,
      }
    : {};

  const response = await request(
    '/fraud/analyze/',
    {
      method: 'POST',
      body,
    }
  );

  return unwrap(response, [
    'data',
    'result',
    'results',
  ]);
};

// ============================================================
// FRAUD RINGS
// ============================================================

const getFraudRings = async () => {
  const response = await request(
    '/fraud/rings/',
    {
      method: 'GET',
    }
  );

  return asArray(response, [
    'data',
    'results',
    'rings',
  ]);
};

// ============================================================
// FRAUD WALLETS
// ============================================================

const getFraudWallets = async () => {
  const response = await request(
    '/fraud/wallets/',
    {
      method: 'GET',
    }
  );

  return asArray(response, [
    'data',
    'results',
    'wallets',
  ]);
};

// ============================================================
// TEMPORAL VALIDATION
// ============================================================

const getTemporalValidationData =
  async () => {
    const response = await request(
      '/fraud/temporal/',
      {
        method: 'GET',
      }
    );

    return unwrap(response, [
      'data',
      'results',
    ]);
  };

// ============================================================
// ADVERSARIAL TESTING
// ============================================================

const getAdversarialTestingData =
  async () => {
    const response = await request(
      '/fraud/adversarial/run/',
      {
        method: 'POST',
        body: {},
      }
    );

    return unwrap(response, [
      'data',
      'result',
      'results',
    ]);
  };

// ============================================================
// RESULTS
// ============================================================

const getResultsSummary = async () => {
  const response = await request(
    '/fraud/results/',
    {
      method: 'GET',
    }
  );

  return unwrap(response, [
    'data',
    'results',
    'summary',
  ]);
};

// ============================================================
// MODEL PERFORMANCE
// ============================================================

const getModelPerformance = async () => {
  const response = await request(
    '/fraud/model-performance/',
    {
      method: 'GET',
    }
  );

  return unwrap(response, [
    'data',
    'results',
    'performance',
  ]);
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export const fraudService = {
  getDashboardStats,
  getTransactions,
  getNetworkData,
  runDetection,
  getFraudRings,
  getFraudWallets,
  getTemporalValidationData,
  getAdversarialTestingData,
  getResultsSummary,
  getModelPerformance,
};

export default fraudService;