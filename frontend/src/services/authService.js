/* ============================================================
   RINGFINDER AUTH SERVICE
   Django REST Framework + JWT
   ============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000/api';


/* ============================================================
   STORAGE KEYS
   ============================================================ */

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CURRENT_USER_KEY = 'ringfinder_current_user';


/* ============================================================
   TOKEN HELPERS
   ============================================================ */

const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
};

const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
};


/* ============================================================
   ROLE NORMALIZATION
   Django Backend:
     ADMIN
     FRAUD_ANALYST

   React Frontend:
     admin
     analyst
   ============================================================ */

const normalizeRole = (role) => {
  if (!role) {
    return '';
  }

  const normalized = String(role)
    .trim()
    .toUpperCase();

  if (
    normalized === 'ADMIN' ||
    normalized === 'ADMINISTRATOR'
  ) {
    return 'admin';
  }

  if (
    normalized === 'FRAUD_ANALYST' ||
    normalized === 'FRAUD-ANALYST' ||
    normalized === 'FRAUD ANALYST' ||
    normalized === 'ANALYST'
  ) {
    return 'analyst';
  }

  return String(role)
    .trim()
    .toLowerCase();
};


/* ============================================================
   STATUS NORMALIZATION
   ============================================================ */

const normalizeStatus = (status) => {
  if (!status) {
    return '';
  }

  return String(status)
    .trim()
    .toLowerCase();
};


/* ============================================================
   USER NORMALIZATION
   ============================================================ */

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    ...user,

    role: normalizeRole(user.role),

    status: normalizeStatus(user.status),
  };
};


/* ============================================================
   REQUEST HEADERS
   ============================================================ */

const buildHeaders = (includeAuth = false) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAccessToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};


/* ============================================================
   VALIDATION ERROR HELPER
   ============================================================ */

const extractValidationError = (data) => {
  if (!data) {
    return '';
  }

  if (data.errors) {
    if (typeof data.errors === 'string') {
      return data.errors;
    }

    if (typeof data.errors === 'object') {
      const firstKey = Object.keys(data.errors)[0];

      if (firstKey) {
        const value = data.errors[firstKey];

        if (Array.isArray(value)) {
          return value[0];
        }

        return String(value);
      }
    }
  }

  if (data.detail) {
    return String(data.detail);
  }

  if (data.message) {
    return String(data.message);
  }

  return '';
};


/* ============================================================
   API REQUEST
   ============================================================ */

const apiRequest = async (
  endpoint,
  {
    method = 'GET',
    body = undefined,
    authenticated = false,
  } = {}
) => {
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method,
        headers: buildHeaders(authenticated),
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      }
    );
  } catch (networkError) {
    const error = new Error(
      'Unable to connect to RingFinder backend. Make sure Django is running on http://127.0.0.1:8000.'
    );

    error.status = 0;
    error.data = networkError;

    throw error;
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      extractValidationError(data) ||
      `Request failed with status ${response.status}`;

    const error = new Error(message);

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};


/* ============================================================
   CURRENT USER STORAGE
   ============================================================ */

export const getCurrentUserFromStorage = () => {
  const storedUser =
    localStorage.getItem(CURRENT_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(storedUser);

    return normalizeUser(parsedUser);
  } catch (error) {
    console.error(
      'Failed to parse stored RingFinder user:',
      error
    );

    localStorage.removeItem(CURRENT_USER_KEY);

    return null;
  }
};


/* ============================================================
   SAVE CURRENT USER
   ============================================================ */

const saveCurrentUser = (user) => {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);

    return null;
  }

  const normalizedUser = normalizeUser(user);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(normalizedUser)
  );

  return normalizedUser;
};


/* ============================================================
   SAVE TOKENS
   ============================================================ */

const saveTokens = ({
  access,
  refresh,
}) => {
  if (access) {
    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      access
    );
  }

  if (refresh) {
    localStorage.setItem(
      REFRESH_TOKEN_KEY,
      refresh
    );
  }
};


/* ============================================================
   CLEAR AUTHENTICATION
   ============================================================ */

const clearAuthentication = () => {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  localStorage.removeItem(
    REFRESH_TOKEN_KEY
  );

  localStorage.removeItem(
    CURRENT_USER_KEY
  );
};


/* ============================================================
   TOKEN REFRESH
   ============================================================ */

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await apiRequest(
      '/auth/token/refresh/',
      {
        method: 'POST',

        body: {
          refresh: refreshToken,
        },

        authenticated: false,
      }
    );

    if (response?.access) {
      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        response.access
      );

      return response.access;
    }

    return null;
  } catch (error) {
    console.error(
      'RingFinder token refresh failed:',
      error
    );

    clearAuthentication();

    return null;
  }
};


/* ============================================================
   AUTH SERVICE
   ============================================================ */

export const authService = {

  /* ==========================================================
     LOGIN
     ========================================================== */

  login: async (
    email,
    password
  ) => {
    if (!email || !password) {
      throw new Error(
        'Email and password are required.'
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    try {
      const response =
        await apiRequest(
          '/auth/login/',
          {
            method: 'POST',

            body: {
              email: normalizedEmail,
              password,
            },

            authenticated: false,
          }
        );

      /*
        Expected Django response:

        {
          success: true,
          message: "Login successful",
          access: "...",
          refresh: "...",
          user: {
            id: 1,
            full_name: "...",
            email: "...",
            role: "ADMIN",
            status: "APPROVED"
          }
        }
      */

      if (
        !response?.access ||
        !response?.refresh ||
        !response?.user
      ) {
        throw new Error(
          'Invalid login response received from server.'
        );
      }

      /* Save JWT tokens */
      saveTokens({
        access: response.access,
        refresh: response.refresh,
      });

      /* Normalize Django role/status before storing */
      const normalizedUser =
        saveCurrentUser(response.user);

      /*
        IMPORTANT:

        Django:
          ADMIN → admin
          FRAUD_ANALYST → analyst

        React now receives the normalized role.
      */

      console.log(
        'RingFinder login successful:',
        {
          email: normalizedUser?.email,
          role: normalizedUser?.role,
          status: normalizedUser?.status,
        }
      );

      return {
        success: true,

        message:
          response.message ||
          'Login successful.',

        access: response.access,

        refresh: response.refresh,

        user: normalizedUser,
      };
    } catch (error) {
      console.error(
        'RingFinder login failed:',
        error
      );

      const message =
        error?.message ||
        'Login failed. Please check your credentials.';

      const authError =
        new Error(message);

      authError.status =
        error?.status;

      authError.data =
        error?.data;

      throw authError;
    }
  },


  /* ==========================================================
     REGISTER
     ========================================================== */

  register: async (
    registrationData
  ) => {
    if (!registrationData) {
      throw new Error(
        'Registration data is required.'
      );
    }

    const name =
      registrationData.name ||
      registrationData.full_name ||
      '';

    const email =
      registrationData.email ||
      '';

    const password =
      registrationData.password ||
      '';

    if (!name.trim()) {
      throw new Error(
        'Full name is required.'
      );
    }

    if (!email.trim()) {
      throw new Error(
        'Email is required.'
      );
    }

    if (!password) {
      throw new Error(
        'Password is required.'
      );
    }

    /*
      Django RegisterSerializer expects:

      full_name
      email
      password
      phone
      organization
      reason

      Django assigns:
      role = FRAUD_ANALYST
      status = PENDING
    */

    const payload = {
      full_name:
        name.trim(),

      email:
        email.trim().toLowerCase(),

      password,

      phone:
        registrationData.phone?.trim() ||
        '',

      organization:
        registrationData.organization?.trim() ||
        '',

      reason:
        registrationData.reason?.trim() ||
        '',
    };

    try {
      const response =
        await apiRequest(
          '/auth/register/',
          {
            method: 'POST',

            body: payload,

            authenticated: false,
          }
        );

      const registeredUser =
        response?.data ||
        response?.user ||
        null;

      return {
        success:
          response?.success !== false,

        message:
          response?.message ||
          'Registration successful. Your account is pending admin approval.',

        user:
          registeredUser
            ? normalizeUser(registeredUser)
            : null,

        data:
          registeredUser
            ? normalizeUser(registeredUser)
            : null,
      };
    } catch (error) {
      console.error(
        'RingFinder registration failed:',
        error
      );

      const message =
        error?.message ||
        'Registration failed. Please try again.';

      const registrationError =
        new Error(message);

      registrationError.status =
        error?.status;

      registrationError.data =
        error?.data;

      throw registrationError;
    }
  },


  /* ==========================================================
     LOGOUT
     ========================================================== */

  logout: async () => {
    const refreshToken =
      getRefreshToken();

    try {
      /*
        Django logout requires refresh token.
      */

      if (refreshToken) {
        await apiRequest(
          '/auth/logout/',
          {
            method: 'POST',

            body: {
              refresh: refreshToken,
            },

            authenticated: true,
          }
        );
      }
    } catch (error) {
      /*
        Even if backend logout fails,
        clear frontend authentication.
      */

      console.warn(
        'RingFinder server logout failed:',
        error
      );
    } finally {
      clearAuthentication();
    }

    return {
      success: true,

      message:
        'Logged out successfully.',
    };
  },


  /* ==========================================================
     GET CURRENT USER FROM LOCAL STORAGE
     ========================================================== */

  getCurrentUser: () => {
    return getCurrentUserFromStorage();
  },


  /* ==========================================================
     FETCH CURRENT USER FROM DJANGO
     ========================================================== */

  fetchCurrentUser: async () => {
    try {
      const response =
        await apiRequest(
          '/auth/me/',
          {
            method: 'GET',

            authenticated: true,
          }
        );

      /*
        Expected:

        {
          success: true,
          data: {...}
        }
      */

      const user =
        response?.data ||
        response?.user ||
        response;

      if (!user) {
        return null;
      }

      const normalizedUser =
        saveCurrentUser(user);

      return normalizedUser;
    } catch (error) {
      /*
        Access token may have expired.
        Try refreshing once.
      */

      if (error?.status === 401) {
        const newAccessToken =
          await refreshAccessToken();

        if (newAccessToken) {
          try {
            const retryResponse =
              await apiRequest(
                '/auth/me/',
                {
                  method: 'GET',

                  authenticated: true,
                }
              );

            const user =
              retryResponse?.data ||
              retryResponse?.user ||
              retryResponse;

            if (user) {
              const normalizedUser =
                saveCurrentUser(user);

              return normalizedUser;
            }
          } catch (retryError) {
            console.error(
              'Retry current-user request failed:',
              retryError
            );
          }
        }
      }

      clearAuthentication();

      return null;
    }
  },


  /* ==========================================================
     REFRESH CURRENT USER
     ========================================================== */

  refreshCurrentUser:
    async () => {
      const accessToken =
        getAccessToken();

      if (!accessToken) {
        return null;
      }

      return await authService.fetchCurrentUser();
    },


  /* ==========================================================
     GET ACCESS TOKEN
     ========================================================== */

  getAccessToken: () => {
    return getAccessToken();
  },


  /* ==========================================================
     GET REFRESH TOKEN
     ========================================================== */

  getRefreshToken: () => {
    return getRefreshToken();
  },


  /* ==========================================================
     CHECK AUTHENTICATION
     ========================================================== */

  isAuthenticated: () => {
    return Boolean(
      getAccessToken()
    );
  },


  /* ==========================================================
     CLEAR AUTHENTICATION
     ========================================================== */

  clearAuthentication: () => {
    clearAuthentication();
  },
};


/* ============================================================
   DEFAULT EXPORT
   ============================================================ */

export default authService;