import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:3000/",
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
