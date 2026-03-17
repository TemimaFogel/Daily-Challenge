import axios from "axios";
import { authStore } from "@/auth/authStore";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";

export const http = axios.create({
  baseURL,
});

http.interceptors.request.use((config) => {
  const token = authStore.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.clearToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
