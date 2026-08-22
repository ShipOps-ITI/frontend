import axios from "axios";
import { getRuntimeEnv } from "../config/runtimeEnv";

const coreApi = axios.create({
  baseURL: getRuntimeEnv("VITE_CORE_URL", "http://localhost:5002/api/v1"),
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
