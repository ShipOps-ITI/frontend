import axios from "axios";

const dashboardAPI = axios.create({
  baseURL: import.meta.env.VITE_DASHBOARD_URL || "http://localhost:5003",
  headers: {
    "Content-Type": "application/json",
  },
});

dashboardAPI.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export const getStatistics = () => {
  return dashboardAPI.get("/dashboard/statistics");
};
