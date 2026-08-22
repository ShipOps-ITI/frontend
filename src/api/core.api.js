import axios from "axios";
import getEnv from "../runtimeEnv";

const coreApi = axios.create({
  baseURL: getEnv("VITE_CORE_URL") || "/api/v1",
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
