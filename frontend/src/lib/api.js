import axios from "axios";

// Dynamic Base URL:
// 1. An explicitly configured VITE_API_URL always wins. This is required when
//    the static frontend is deployed separately from the Express API (Vercel + Render).
// 2. Otherwise, production uses same-origin Vercel functions.
// 3. Local development defaults to the local Express server.
const getBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || "").trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return ""; // Same origin on Vercel deployment
  }
  return "http://localhost:5000";
};

const baseURL = getBaseUrl();

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isSeoPortal = window.location.pathname === "/post/seo";
      const isAuthPath = window.location.pathname.includes("/login") || isSeoPortal;
      if (isSeoPortal && localStorage.getItem("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      }
      if (!isAuthPath) {
        // Clear stale credentials if invalid/expired
        const hadToken = Boolean(localStorage.getItem("token"));
        if (hadToken) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          const msg =
            error.response?.data?.message ||
            "Your secure JWT session has expired. Please login again.";
          sessionStorage.setItem("session_ended_notice", msg);
          window.location.href = "/login?session=expired";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
