/* ============================================================
   MOCK API CONFIGURATION
   ============================================================ */

export const MOCK_DELAY = 400;


/* ============================================================
   MOCK API REQUEST HELPER
   ============================================================ */

/**
 * Simulates an asynchronous API request.
 *
 * @param {*} data
 *        Data returned by the mock API.
 *
 * @param {number} delay
 *        Artificial network response delay in milliseconds.
 *
 * @param {boolean} shouldFail
 *        When true, the simulated request is rejected.
 *
 * @returns {Promise<{status: number, data: *}>}
 */

export const apiCall = async (
  data,
  delay = MOCK_DELAY,
  shouldFail = false
) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {

      /* --------------------------------------------------------
         SIMULATE API FAILURE
         -------------------------------------------------------- */

      if (shouldFail) {
        reject(
          new Error('API Request Failed')
        );

        return;
      }


      /* --------------------------------------------------------
         SUCCESSFUL API RESPONSE
         -------------------------------------------------------- */

      resolve({
        status: 200,
        data,
      });

    }, delay);
  });
};


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const post = async (endpoint, body) => {
  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return { status: response.status, data };
};

/* ============================================================
   DEFAULT EXPORT
   ============================================================ */

export default {
  apiCall,
  post,
};