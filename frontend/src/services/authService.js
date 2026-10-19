import api from "./api";

const PENDING_LOGOUT_KEY = "ceypetco_pending_logout";

const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    localStorage.removeItem(PENDING_LOGOUT_KEY);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    localStorage.setItem(PENDING_LOGOUT_KEY, String(Date.now()));
    try {
      await api.post("/auth/logout");
      localStorage.removeItem(PENDING_LOGOUT_KEY);
    } catch {
      // Keep the marker so logout is retried when connectivity returns.
    }
    localStorage.removeItem("ceypetco_token");
    localStorage.removeItem("ceypetco_user");
  },

  hasPendingLogout: () => Boolean(localStorage.getItem(PENDING_LOGOUT_KEY)),

  getUser: () => {
    localStorage.removeItem("ceypetco_token");
    const user = localStorage.getItem("ceypetco_user");
    return user ? JSON.parse(user) : null;
  },

  setAuth: (user) => {
    localStorage.removeItem("ceypetco_token");
    localStorage.setItem("ceypetco_user", JSON.stringify(user));
  },
};

export default authService;
