import axios from "axios";

const documentAPI = axios.create({
  baseURL: import.meta.env.VITE_DOCUMENT_URL || "http://localhost:5003",
});

export const getDocuments = () => {
  return documentAPI.get("/documents");
};

export const getDocument = (id) => {
  return documentAPI.get(`/documents/${id}`);
};

export const uploadDocument = (formData) => {
  return documentAPI.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const downloadDocument = (id) => {
  return documentAPI.get(`/documents/${id}/download`, {
    responseType: "blob",
  });
};

export const deleteDocument = (id) => {
  return documentAPI.delete(`/documents/${id}`);
};
