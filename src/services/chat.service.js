import axios from "axios";
<<<<<<< HEAD
import getEnv from "../runtimeEnv";

const chatAPI = axios.create({
  baseURL: getEnv("VITE_AI_URL") || "/api/v1/ai",
=======
import { getRuntimeEnv } from "../config/runtimeEnv";

const chatApi = axios.create({
  baseURL: getRuntimeEnv("VITE_AI_URL", "http://localhost:5005/api/v1/ai"),
>>>>>>> 865c419 (feat: add company admin onboarding and improve shipment workflows)
  headers: { "Content-Type": "application/json" },
});

chatAPI.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export const askAssistant = (question) => chatAPI.post("/chat", { question });
