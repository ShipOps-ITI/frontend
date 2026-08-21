import axios from "axios";
import { getRuntimeEnv } from "../config/runtimeEnv";

const dashboardAPI = axios.create({
<<<<<<< HEAD
  baseURL: "/dashboard",
=======
  baseURL: getRuntimeEnv("VITE_DASHBOARD_URL", "http://localhost:5003/dashboard"),
>>>>>>> 865c419 (feat: add company admin onboarding and improve shipment workflows)
  headers: {
    "Content-Type": "application/json",
  },
});

dashboardAPI.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

<<<<<<< HEAD
export const getStatistics = () => dashboardAPI.get("/statistics");
=======
export const getStatistics = () => {
  return dashboardAPI.get("/statistics");
};
>>>>>>> 865c419 (feat: add company admin onboarding and improve shipment workflows)
