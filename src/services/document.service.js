import axios from "axios";

const documentAPI = axios.create({
  baseURL: "http://localhost:5000",
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