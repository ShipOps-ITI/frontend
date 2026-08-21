import axios from "axios";
<<<<<<< HEAD
import getEnv from "../runtimeEnv";

const coreApi = axios.create({
  baseURL: getEnv("VITE_CORE_URL") || "/api/v1",
=======
import { getRuntimeEnv } from "../config/runtimeEnv";

const coreApi = axios.create({
  baseURL: getRuntimeEnv("VITE_CORE_URL", "http://localhost:5002/api/v1"),
>>>>>>> 865c419 (feat: add company admin onboarding and improve shipment workflows)
  headers: {
    "Content-Type": "application/json",
  },
});

coreApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default coreApi;
