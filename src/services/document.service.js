import axios from "axios";
import getEnv from "../runtimeEnv";

const documentAPI = axios.create({
  baseURL: getEnv("VITE_DOCUMENT_URL") || "/documents",
});

documentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDocuments = () => {
  return documentAPI.get("/");
};

export const getDocument = (id) => {
  return documentAPI.get(`/${id}`);
};

export const uploadDocument = (formData) => {
  return documentAPI.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const downloadDocument = (id) => {
  return documentAPI.get(`/${id}/download`, {
    responseType: "blob",
  });
};

export const deleteDocument = (id) => {
  return documentAPI.delete(`/${id}`);
};
