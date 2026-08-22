import axios from "axios";
import getEnv from "../runtimeEnv";

const chatAPI = axios.create({
  baseURL: getEnv("VITE_AI_URL") || "/api/v1/ai",
  headers: { "Content-Type": "application/json" },
});

chatAPI.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export const askAssistant = (question) => chatAPI.post("/chat", { question });
