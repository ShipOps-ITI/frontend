import api from "../api/axios";

export const getShips = (page = 1, limit = 10) =>
  api.get("/ships", { params: { page, limit } });

export const getShip = (id) => api.get(`/ships/${id}`);

export const createShip = (data) => api.post("/ships", data);

export const updateShip = (id, data) => api.put(`/ships/${id}`, data);

export const deleteShip = (id) => api.delete(`/ships/${id}`);
