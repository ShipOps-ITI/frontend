import axios from "axios";

const dashboardAPI = axios.create({
  baseURL: "/dashboard",
  headers: {
    "Content-Type": "application/json",
  },
});

dashboardAPI.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export const getStatistics = () => dashboardAPI.get("/statistics");
