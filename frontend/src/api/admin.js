import api from "./axios";

export const getAllUsers = (params) => api.get("/api/admin/users", { params });
export const approveUser = (id) => api.patch(`/api/admin/users/${id}/approve`);
export const blockUser = (id) => api.patch(`/api/admin/users/${id}/block`);
export const unblockUser = (id) => api.patch(`/api/admin/users/${id}/unblock`);

export const getAdminServices = () => api.get("/api/admin/services");
export const createService = (data) => api.post("/api/admin/services", data);
export const updateService = (id, data) => api.put(`/api/admin/services/${id}`, data);
export const deleteService = (id) => api.delete(`/api/admin/services/${id}`);

export const getStats = () => api.get("/api/admin/stats");