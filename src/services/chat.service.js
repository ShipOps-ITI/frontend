import axios from "axios";

const chatApi = axios.create({
  baseURL: import.meta.env.VITE_AI_URL || "http://localhost:5005/api/v1/ai",
  headers: { "Content-Type": "application/json" },
});

chatApi.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

export const askAssistant = (question) => chatApi.post("/chat", { question });
