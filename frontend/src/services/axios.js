import axios from "axios";

const isLocal = window.location.hostname === "localhost";

export const API = axios.create({
  baseURL: isLocal
    ? "http://localhost:3000"
    : "https://tutaiyb04.github.io/Shop_Duck_Khoa_luan",
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
