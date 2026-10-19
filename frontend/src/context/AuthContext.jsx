import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const LAST_ACTIVITY_KEY = "ceypetco_admin_last_activity";
const PENDING_LOGOUT_KEY = "ceypetco_pending_logout";

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
      const savedActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
      if (savedActivity && Date.now() - savedActivity >= IDLE_TIMEOUT_MS) {
        await authService.logout();
        setUser(null);
        return;
      }
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.data);
      } else {
        authService.logout();
        setUser(null);
      }
    } catch {
      authService.logout();
      setUser(null);
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
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
      setUser(response.data.user);
    }
    return response;
  };

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
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

  useEffect(() => {
    if (!user) return undefined;
    let timer;
    let loggingOut = false;
    let lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();

    const expireSession = () => {
      if (loggingOut) return;
      loggingOut = true;
      void logout();
    };
    const scheduleExpiry = () => {
      window.clearTimeout(timer);
      const remaining = IDLE_TIMEOUT_MS - (Date.now() - lastActivity);
      if (remaining <= 0) expireSession();
      else timer = window.setTimeout(expireSession, remaining);
    };
    const recordActivity = () => {
      lastActivity = Date.now();
      localStorage.setItem(LAST_ACTIVITY_KEY, String(lastActivity));
      scheduleExpiry();
    };
    const checkElapsedTime = () => {
      if (document.visibilityState === "visible") scheduleExpiry();
    };
    const handleStorage = (event) => {
      if (event.key === LAST_ACTIVITY_KEY && event.newValue) {
        lastActivity = Number(event.newValue) || lastActivity;
        scheduleExpiry();
      }
      if (event.key === PENDING_LOGOUT_KEY && event.newValue) expireSession();
    };

    const activityEvents = ["pointerdown", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((eventName) => window.addEventListener(eventName, recordActivity, { passive: true }));
    document.addEventListener("visibilitychange", checkElapsedTime);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("offline", expireSession);
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    connection?.addEventListener?.("change", expireSession);
    recordActivity();

    return () => {
      window.clearTimeout(timer);
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, recordActivity));
      document.removeEventListener("visibilitychange", checkElapsedTime);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("offline", expireSession);
      connection?.removeEventListener?.("change", expireSession);
    };
  }, [user, logout]);

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
