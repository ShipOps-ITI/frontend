import api from "../api/axios";

export const getUsers = () => api.get("/api/users").then((res) => res.data);

export const createUser = (data) =>
    api.post("/api/users", data).then((res) => res.data);

export const updateUserRole = (id, role) =>
    api.patch(`/api/users/${id}/role`, { role }).then((res) => res.data);
