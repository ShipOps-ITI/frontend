import axios from "axios";
import getEnv from "../runtimeEnv";
import { showToast } from "../components/Toast/toast";

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

coreApi.interceptors.response.use((response) => {
  if (["post", "put", "patch", "delete"].includes(response.config.method)) showToast(response.config.method === "delete" ? "Deleted successfully." : "Changes saved successfully.");
  return response;
}, (error) => {
  if (error.response?.status !== 401) showToast(error.response?.data?.message || "The operation could not be completed.", "error");
  return Promise.reject(error);
});

export default coreApi;
