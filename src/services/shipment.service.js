import axios from "axios";

const shipmentAPI = axios.create({
  baseURL: "http://localhost:5001/api",
});

shipmentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); 

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getShipments = () => shipmentAPI.get("/shipments");

export const getShipment = (id) => shipmentAPI.get(`/shipments/${id}`);

export const createShipment = (data) => shipmentAPI.post("/shipments", data);

export const updateShipment = (id, data) =>
  shipmentAPI.put(`/shipments/${id}`, data);

export const deleteShipment = (id) =>
  shipmentAPI.delete(`/shipments/${id}`);