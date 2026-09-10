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


/* ============================================================
   DEFAULT EXPORT
   ============================================================ */

export default {
  apiCall,
};