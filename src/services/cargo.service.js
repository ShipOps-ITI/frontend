import axios from "axios";

const cargoAPI = axios.create({
  baseURL: import.meta.env.VITE_CARGO_URL || "http://localhost:5002/api/cargo",
});

cargoAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getCargo = (params = {}) =>
  cargoAPI.get("/", { params });

export const getCargoById = (id) =>
  cargoAPI.get(`/${id}`);

export const createCargo = (data) =>
  cargoAPI.post("/", data);

export const updateCargo = (id, data) =>
  cargoAPI.put(`/${id}`, data);

export const patchCargo = (id, data) =>
  cargoAPI.patch(`/${id}`, data);

export const deleteCargo = (id) =>
  cargoAPI.delete(`/${id}`);