import axios from "axios";
import { getRuntimeEnv } from "../config/runtimeEnv";

const dashboardAPI = axios.create({
  baseURL: getRuntimeEnv("VITE_DASHBOARD_URL", "http://localhost:5003/dashboard"),
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
  return dashboardAPI.get("/statistics");
};
