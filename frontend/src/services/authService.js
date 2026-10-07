import api from "./api";

const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Local session state is still cleared when the API is unavailable.
    }
    localStorage.removeItem("ceypetco_user");
  },

  getUser: () => {
    const user = localStorage.getItem("ceypetco_user");
    return user ? JSON.parse(user) : null;
  },

  setAuth: (user) => {
    localStorage.removeItem("ceypetco_token");
    localStorage.setItem("ceypetco_user", JSON.stringify(user));
  },
};

export default authService;
