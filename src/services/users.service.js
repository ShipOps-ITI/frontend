import api from "../api/axios";

export const getUsers = () => api.get("/api/users");

export const getCustomers = () => api.get("/api/users/customers");

export const createUser = (data) => api.post("/api/users", data);

export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
