import api from "../api/axios";

export const getFleets = (page = 1, limit = 10) =>
  api.get("/fleets", { params: { page, limit } });

export const getFleetsByCompany = (companyId) =>
  api.get(`/fleets/company/${companyId}`);

export const getFleet = (id) => api.get(`/fleets/${id}`);

export const createFleet = (data) => api.post("/fleets", data);

export const updateFleet = (id, data) => api.put(`/fleets/${id}`, data);

export const deleteFleet = (id) => api.delete(`/fleets/${id}`);
