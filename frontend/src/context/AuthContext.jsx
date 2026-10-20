import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      if (authService.hasPendingLogout()) {
        await authService.logout();
        setUser(null);
        return;
      }
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch {
      // A temporary API or network failure must not end an existing login.
      setUser(authService.getUser());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.success) {
      authService.setAuth(response.data.user);
      setUser(response.data.user);
    }
    return response;
  };

  const logout = useCallback(async () => {
    setUser(null);
    try {
      await authService.logout();
    } catch { /* Local logout has already completed. */ }
  }, []);

  useEffect(() => {
    const retryPendingLogout = () => {
      if (authService.hasPendingLogout()) void authService.logout();
    };
    window.addEventListener("online", retryPendingLogout);
    return () => window.removeEventListener("online", retryPendingLogout);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
