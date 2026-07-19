import api from "../api/axios";

export const getCompanies = (page = 1, limit = 10) =>
    api.get("/companies", { params: { page, limit } });

export const getCompany = (id) =>
    api.get(`/companies/${id}`);

export const createCompany = (data) =>
    api.post("/companies", data);

export const updateCompany = (id, data) =>
    api.put(`/companies/${id}`, data);

export const deleteCompany = (id) =>
    api.delete(`/companies/${id}`);
