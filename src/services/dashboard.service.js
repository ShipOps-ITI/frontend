import axios from "axios";
import getEnv from "../runtimeEnv";

const dashboardAPI = axios.create({
  baseURL: getEnv("VITE_DASHBOARD_URL") || "/dashboard",
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
