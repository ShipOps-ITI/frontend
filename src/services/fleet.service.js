import api from "../api/axios";

export const getFleets = () => api.get("/fleets");

export const getFleet = (id) => api.get(`/fleets/${id}`);

export const createFleet = (data) => api.post("/fleets", data);

export const updateFleet = (id, data) => api.put(`/fleets/${id}`, data);

export const deleteFleet = (id) => api.delete(`/fleets/${id}`);
