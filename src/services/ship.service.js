import coreApi from "../api/core.api";

export const getShips = (page = 1, limit = 10) =>
  coreApi.get("/ships", { params: { page, limit } });

export const getShip = (id) => coreApi.get(`/ships/${id}`);

export const getShipsByCompany = (companyId) => coreApi.get(`/ships/company/${companyId}`);

export const createShip = (data) => coreApi.post("/ships", data);

export const updateShip = (id, data) => coreApi.put(`/ships/${id}`, data);

export const deleteShip = (id) => coreApi.delete(`/ships/${id}`);
