import coreApi from "../api/core.api";

export const getPorts = (page = 1, limit = 25, search = "") =>
  coreApi.get("/ports", { params: { page, limit, search } });

export const createPort = (data) => coreApi.post("/ports", data);
export const updatePort = (id, data) => coreApi.put(`/ports/${id}`, data);
export const deletePort = (id) => coreApi.delete(`/ports/${id}`);
