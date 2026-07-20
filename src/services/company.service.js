import coreApi from "../api/core.api";

export const getCompanies = (page = 1, limit = 10) =>
    coreApi.get("/companies", { params: { page, limit } });

export const getCompany = (id) =>
    coreApi.get(`/companies/${id}`);

export const createCompany = (data) =>
    coreApi.post("/companies", data);

export const updateCompany = (id, data) =>
    coreApi.put(`/companies/${id}`, data);

export const deleteCompany = (id) =>
    coreApi.delete(`/companies/${id}`);
