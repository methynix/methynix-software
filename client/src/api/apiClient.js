import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 12000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("methynix_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      "We could not reach the server. Please check your connection and try again.";
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
