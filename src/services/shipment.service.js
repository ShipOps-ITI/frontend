import axios from "axios";
import { getRuntimeEnv } from "../config/runtimeEnv";

const shipmentAPI = axios.create({
  baseURL: getRuntimeEnv("VITE_SHIPMENT_URL", "http://localhost:5004/api/shipments"),
});

shipmentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getShipments = (params = {}) => shipmentAPI.get("/", { params });

export const getShipment = (id) => shipmentAPI.get(`/${id}`);

export const createShipment = (data) => shipmentAPI.post("/", data);

export const updateShipment = (id, data) => shipmentAPI.put(`/${id}`, data);

export const deleteShipment = (id) => shipmentAPI.delete(`/${id}`);
