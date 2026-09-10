const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/* ============================================================
   AUTH TOKEN
   ============================================================ */

const getToken = () => {
  return (
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    ''
  );
};

/* ============================================================
   REQUEST HELPERS
   ============================================================ */

const buildHeaders = (extraHeaders = {}) => {
  const headers = {
    Accept: 'application/json',
    ...extraHeaders,
  };

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
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        url.searchParams.append(key, value);
      }
    });
  }

  const options = {
    method,
    headers: buildHeaders(
      isFormData
        ? {}
        : body !== undefined
          ? {
              'Content-Type': 'application/json',
            }
          : {}
    ),
  };

  if (body !== undefined) {
    options.body = isFormData
      ? body
      : JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);
    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

/* ============================================================
   RESPONSE HELPERS
   ============================================================ */

const unwrapData = (response) => {
  if (response?.data !== undefined) {
    return response.data;
  }

  return response;
};

const unwrapArray = (response) => {
  const data = unwrapData(response);

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

/* ============================================================
   ADMIN SERVICE
   ============================================================ */

const adminService = {
  /* ==========================================================
     ADMIN DASHBOARD
     ========================================================== */

  getDashboardStats: async () => {
    const response = await request('/admin/dashboard/');

    return unwrapData(response);
  },

  /* ==========================================================
     PENDING ANALYSTS
     ========================================================== */

  getPendingAnalysts: async () => {
    const response = await request(
      '/admin/analysts/pending/'
    );

    return unwrapArray(response);
  },

  /* ==========================================================
     ALL ANALYSTS
     ========================================================== */

  getAllAnalysts: async () => {
    const response = await request(
      '/admin/analysts/'
    );

    return unwrapArray(response);
  },

  /* ==========================================================
     GET ANALYST DETAILS
     ========================================================== */

  getAnalyst: async (analystId) => {
    if (!analystId) {
      throw new Error('Analyst ID is required.');
    }

    const response = await request(
      `/admin/analysts/${analystId}/`
    );

    return unwrapData(response);
  },

  /* ==========================================================
     APPROVE ANALYST
     ========================================================== */

  approveAnalyst: async (analystId) => {
    if (!analystId) {
      throw new Error('Analyst ID is required.');
    }

    const response = await request(
      `/admin/analysts/${analystId}/approve/`,
      {
        method: 'POST',
      }
    );

    return {
      success: true,
      message:
        response?.message ||
        'Analyst approved successfully.',
      analyst: response?.analyst || null,
      data: response,
    };
  },

  /* ==========================================================
     REJECT ANALYST
     ========================================================== */

  rejectAnalyst: async (analystId) => {
    if (!analystId) {
      throw new Error('Analyst ID is required.');
    }

    const response = await request(
      `/admin/analysts/${analystId}/reject/`,
      {
        method: 'POST',
      }
    );

    return {
      success: true,
      message:
        response?.message ||
        'Analyst rejected successfully.',
      analyst: response?.analyst || null,
      data: response,
    };
  },

  /* ==========================================================
     ACTIVATE ANALYST
     ========================================================== */

  activateAnalyst: async (analystId) => {
    if (!analystId) {
      throw new Error('Analyst ID is required.');
    }

    const response = await request(
      `/admin/analysts/${analystId}/activate/`,
      {
        method: 'POST',
      }
    );

    return {
      success: true,
      message:
        response?.message ||
        'Analyst activated successfully.',
      analyst: unwrapData(response),
      data: response,
    };
  },

  /* ==========================================================
     DEACTIVATE ANALYST
     ========================================================== */

  deactivateAnalyst: async (analystId) => {
    if (!analystId) {
      throw new Error('Analyst ID is required.');
    }

    const response = await request(
      `/admin/analysts/${analystId}/deactivate/`,
      {
        method: 'POST',
      }
    );

    return {
      success: true,
      message:
        response?.message ||
        'Analyst deactivated successfully.',
      analyst: unwrapData(response),
      data: response,
    };
  },

  /* ==========================================================
     DATASETS
     ========================================================== */

  getDatasets: async () => {
    const response = await request('/datasets/');

    return unwrapArray(response);
  },

  /* ==========================================================
     ADD / UPLOAD DATASET
     ========================================================== */

  addDataset: async (dataset) => {
    /*
      Supports:

      addDataset({
        name: 'My Dataset',
        file: selectedFile
      })

      or

      addDataset({
        file: selectedFile
      })
    */

    if (!dataset) {
      throw new Error('Dataset data is required.');
    }

    const file =
      dataset instanceof File
        ? dataset
        : dataset.file;

    if (!file) {
      throw new Error('Dataset file is required.');
    }

    const formData = new FormData();

    formData.append('file', file);

    if (dataset.name) {
      formData.append('name', dataset.name);
    }

    if (dataset.description) {
      formData.append(
        'description',
        dataset.description
      );
    }

    const response = await request('/datasets/', {
      method: 'POST',
      body: formData,
      isFormData: true,
    });

    return unwrapData(response);
  },

  /* ==========================================================
     DELETE DATASET
     ========================================================== */

  deleteDataset: async (datasetId) => {
    if (!datasetId) {
      throw new Error('Dataset ID is required.');
    }

    const response = await request(
      `/datasets/${datasetId}/`,
      {
        method: 'DELETE',
      }
    );

    return {
      success: true,
      message:
        response?.message ||
        'Dataset deleted successfully.',
      data: response,
    };
  },

  /* ==========================================================
     IMPORT DATASET
     ========================================================== */

  importDataset: async (datasetId) => {
    if (!datasetId) {
      throw new Error('Dataset ID is required.');
    }

    const response = await request(
      `/datasets/${datasetId}/import/`,
      {
        method: 'POST',
      }
    );

    return unwrapData(response);
  },

  /* ==========================================================
     DATASET PREVIEW
     ========================================================== */

  previewDataset: async (datasetId) => {
    if (!datasetId) {
      throw new Error('Dataset ID is required.');
    }

    const response = await request(
      `/datasets/${datasetId}/preview/`
    );

    return unwrapData(response);
  },

  /* ==========================================================
     FRAUD RESULTS
     ========================================================== */

  getFraudResults: async (params = {}) => {
    const response = await request(
      '/admin/fraud-results/',
      {
        query: params,
      }
    );

    return response;
  },

  /* ==========================================================
     FRAUD RINGS
     ========================================================== */

  getFraudRings: async () => {
    const response = await request(
      '/admin/fraud-rings/'
    );

    return unwrapArray(response);
  },

  /* ==========================================================
     TEMPORAL RESULTS
     ========================================================== */

  getTemporalResults: async () => {
    const response = await request(
      '/admin/temporal-results/'
    );

    return unwrapArray(response);
  },

  /* ==========================================================
     ADVERSARIAL RESULTS
     ========================================================== */

  getAdversarialResults: async () => {
    const response = await request(
      '/admin/adversarial-results/'
    );

    return unwrapArray(response);
  },

  /* ==========================================================
     ACTIVITY LOGS
     ========================================================== */

  getActivityLogs: async (params = {}) => {
    const response = await request(
      '/admin/activity-logs/',
      {
        query: params,
      }
    );

    return response;
  },

  /* ==========================================================
     SYSTEM SETTINGS
     ========================================================== */

  getSystemSettings: async () => {
    const response = await request(
      '/admin/settings/'
    );

    return unwrapArray(response);
  },

  /* ==========================================================
     UPDATE SYSTEM SETTINGS
     ========================================================== */

  updateSystemSettings: async (
    updatedSettings
  ) => {
    if (!updatedSettings) {
      throw new Error(
        'System settings are required.'
      );
    }

    /*
      Backend expects:

      {
        key: 'global_config',
        value: {
          ...
        },
        description: '...'
      }
    */

    const payload =
      updatedSettings.key ||
      updatedSettings.value ||
      updatedSettings.description
        ? updatedSettings
        : {
            key: 'global_config',
            value: updatedSettings,
          };

    const response = await request(
      '/admin/settings/',
      {
        method: 'PUT',
        body: payload,
      }
    );

    return unwrapData(response);
  },
};

export default adminService;