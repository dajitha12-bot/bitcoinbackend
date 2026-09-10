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
   API HELPERS
   ============================================================ */

const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || '';
};

const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
};

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
  const response = await fetch(
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

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.detail ||
        data?.error ||
        extractValidationError(data) ||
        `Request failed with status ${response.status}`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

/* ============================================================
   VALIDATION ERROR HELPER
   ============================================================ */

const extractValidationError = (data) => {
  if (!data?.errors) {
    return '';
  }

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

  return '';
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
    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      'Failed to parse stored RingFinder user:',
      error
    );

    localStorage.removeItem(CURRENT_USER_KEY);

    return null;
  }
};

const saveCurrentUser = (user) => {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user)
  );
};

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
       Backend response:

       {
         success: true,
         message: "Login successful",
         access: "...",
         refresh: "...",
         user: {...}
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

      saveTokens({
        access: response.access,
        refresh: response.refresh,
      });

      saveCurrentUser(
        response.user
      );

      return {
        success: true,
        message:
          response.message ||
          'Login successful',
        access: response.access,
        refresh: response.refresh,
        user: response.user,
      };
    } catch (error) {
      /*
       Django backend already returns specific
       messages for:

       - Invalid credentials
       - Pending analyst
       - Rejected analyst
       - Inactive analyst
      */

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
      registrationData.email || '';

    const password =
      registrationData.password || '';

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
      Backend RegisterSerializer expects:

      full_name
      email
      password
      phone
      organization
      reason

      role/status are assigned by Django.
    */

    const payload = {
      full_name: name.trim(),

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

      /*
       Registration does NOT automatically
       authenticate the user.

       Django creates the analyst with
       status = PENDING.
      */

      return {
        success:
          response?.success !== false,

        message:
          response?.message ||
          'Registration successful. Your account is pending admin approval.',

        user:
          response?.data ||
          null,

        data:
          response?.data ||
          null,
      };
    } catch (error) {
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
       Django logout requires the
       refresh token so it can blacklist it.
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
       Even if the server-side logout
       fails, remove local authentication.
      */

      console.warn(
        'Server logout failed:',
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
     GET CURRENT USER
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
       Backend response:

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

      saveCurrentUser(user);

      return user;
    } catch (error) {
      /*
       Access token may have expired.
       Try refreshing it once.
      */

      if (
        error?.status === 401
      ) {
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
              saveCurrentUser(
                user
              );

              return user;
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