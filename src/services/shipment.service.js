import axios from "axios";
import getEnv from "../runtimeEnv";
import { showToast } from "../components/Toast/toast";

const shipmentAPI = axios.create({
  baseURL: getEnv("VITE_SHIPMENT_URL") || "/api/shipments",
});

shipmentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

shipmentAPI.interceptors.response.use((response) => {
  if (["post", "put", "patch", "delete"].includes(response.config.method)) showToast(response.config.method === "delete" ? "Shipment deleted." : "Shipment saved successfully.");
  return response;
}, (error) => {
  if (error.response?.status !== 401) showToast(error.response?.data?.message || "Unable to complete the shipment operation.", "error");
  return Promise.reject(error);
});

export const getShipments = (params = {}) => shipmentAPI.get("/", { params });

export const getShipment = (id) => shipmentAPI.get(`/${id}`);

export const createShipment = (data) => shipmentAPI.post("/", data);

export const updateShipment = (id, data) => shipmentAPI.put(`/${id}`, data);

export const deleteShipment = (id) => shipmentAPI.delete(`/${id}`);
