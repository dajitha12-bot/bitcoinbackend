import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     INITIALIZE AUTHENTICATION
     ========================================================= */

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        /*
         * No JWT token means there is no authenticated
         * Django session to restore.
         */
        if (!authService.isAuthenticated()) {
          if (mounted) {
            setUser(null);
          }

          return;
        }

        /*
         * Ask Django for the currently authenticated user.
         *
         * This replaces the old localStorage user database
         * validation.
         */
        const currentUser =
          await authService.fetchCurrentUser();

        if (mounted) {
          setUser(currentUser || null);
        }
      } catch (error) {
        console.error(
          'RingFinder authentication initialization failed:',
          error
        );

        if (mounted) {
          setUser(null);
        }

        /*
         * If the token is invalid/expired, make sure
         * the local authentication state is cleared.
         */
        authService.clearAuthentication();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  /* =========================================================
     LOGIN
     ========================================================= */

  const login = async (
    email,
    password
  ) => {
    try {
      setLoading(true);

      /*
       * authService.login() now communicates with:
       *
       * POST /api/auth/login/
       *
       * Django returns:
       * - access token
       * - refresh token
       * - user
       */
      const data =
        await authService.login(
          email,
          password
        );

      if (data?.user) {
        setUser(data.user);
      } else {
        /*
         * If the login response does not contain
         * user information, retrieve it from Django.
         */
        const currentUser =
          await authService.fetchCurrentUser();

        setUser(
          currentUser || null
        );
      }

      return data;
    } catch (error) {
      console.error(
        'RingFinder login failed:',
        error
      );

      setUser(null);

      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     REGISTER
     ========================================================= */

  const register = async (
    formData
  ) => {
    try {
      /*
       * Registration is handled completely
       * by Django.
       *
       * New analysts are created as PENDING
       * and must be approved by Admin.
       */
      const data =
        await authService.register(
          formData
        );

      return data;
    } catch (error) {
      console.error(
        'RingFinder registration failed:',
        error
      );

      throw error;
    }
  };

  /* =========================================================
     LOGOUT
     ========================================================= */

  const logout = async () => {
    try {
      /*
       * authService.logout() sends the refresh token
       * to Django and clears local JWT/user storage.
       */
      await authService.logout();
    } catch (error) {
      console.error(
        'RingFinder logout failed:',
        error
      );
    } finally {
      /*
       * Regardless of server response,
       * remove the frontend authentication state.
       */
      setUser(null);
    }
  };

  /* =========================================================
     REFRESH CURRENT USER
     ========================================================= */

  const refreshUser = async () => {
    try {
      /*
       * If there is no JWT, there is no authenticated
       * Django session to refresh.
       */
      if (!authService.isAuthenticated()) {
        setUser(null);
        return null;
      }

      /*
       * Fetch the latest user information directly
       * from Django.
       *
       * This is especially important after Admin
       * approves/rejects an analyst.
       */
      const currentUser =
        await authService.refreshCurrentUser();

      if (currentUser) {
        setUser(currentUser);
        return currentUser;
      }

      setUser(null);
      return null;
    } catch (error) {
      console.error(
        'RingFinder user refresh failed:',
        error
      );

      setUser(null);

      return null;
    }
  };

  /* =========================================================
     CONTEXT VALUE
     ========================================================= */

  const contextValue = {
    user,
    loading,

    login,
    register,
    logout,
    refreshUser,

    /*
     * Useful for protected components that need
     * to know whether a JWT session exists.
     */
    isAuthenticated:
      authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ===========================================================
   useAuth HOOK
   =========================================================== */

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};

export default AuthContext;