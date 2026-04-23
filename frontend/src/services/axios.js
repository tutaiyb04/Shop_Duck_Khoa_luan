import axios from "axios";

const isDevHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const API_BASE_URL = isDevHost
  ? "http://localhost:3000"
  : "https://shop-duck-api.onrender.com";

export const API = axios.create({
  baseURL: API_BASE_URL,
});

// tự động đính kèm Token vào Header nếu có
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
