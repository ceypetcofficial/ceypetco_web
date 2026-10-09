import axios from "axios";
import { apiBaseUrl } from "./utils/apiBaseUrl.js";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
