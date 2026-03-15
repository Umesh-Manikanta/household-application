import api from "./axios";

export const getProfessionalRequests = () => api.get("/api/professional/requests");
export const acceptRequest = (id) => api.patch(`/api/professional/requests/${id}/accept`);
export const rejectRequest = (id) => api.patch(`/api/professional/requests/${id}/reject`);
export const getProfile = () => api.get("/api/professional/profile");