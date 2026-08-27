import axios from "axios";
import getEnv from "../runtimeEnv";
import { showToast } from "../components/Toast/toast";

const documentAPI = axios.create({
  baseURL: getEnv("VITE_DOCUMENT_URL") || "/documents",
});

documentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

documentAPI.interceptors.response.use((response) => {
  const messages = {
    post: "Document uploaded successfully.",
    patch: "Document status updated.",
    delete: "Document deleted.",
  };
  if (messages[response.config.method]) showToast(messages[response.config.method]);
  return response;
}, (error) => {
  if (error.response?.status !== 401) showToast(error.response?.data?.message || "Unable to complete the document operation.", "error");
  return Promise.reject(error);
});

export const getDocuments = (params = {}) => {
  return documentAPI.get("/", { params });
};

export const getDocument = (id) => {
  return documentAPI.get(`/${id}`);
};

export const uploadDocument = (formData, onUploadProgress) => {
  return documentAPI.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
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

export const reviewDocument = (id, data) => {
  return documentAPI.patch(`/${id}/review`, data);
};

export const submitDocument = (id) => {
  return documentAPI.patch(`/${id}/submit`);
};
