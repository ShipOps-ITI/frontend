import coreApi from "../api/core.api";

export const getFleets = (page = 1, limit = 10) =>
  coreApi.get("/fleets", { params: { page, limit } });

export const getFleetsByCompany = (companyId) =>
  coreApi.get(`/fleets/company/${companyId}`);

export const getFleet = (id) => coreApi.get(`/fleets/${id}`);

export const createFleet = (data) => coreApi.post("/fleets", data);

export const updateFleet = (id, data) => coreApi.put(`/fleets/${id}`, data);

export const deleteFleet = (id) => coreApi.delete(`/fleets/${id}`);
