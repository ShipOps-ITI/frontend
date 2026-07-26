import api from "../api/axios";

export const getUsers = () => api.get("/api/users");

export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
