import api from "./axios";

export const getServices = (params) => api.get("/api/customer/services", { params });
export const getMyRequests = () => api.get("/api/customer/requests");
export const createRequest = (data) => api.post("/api/customer/requests", data);
export const updateRequest = (id, data) => api.put(`/api/customer/requests/${id}`, data);
export const closeRequest = (id) => api.patch(`/api/customer/requests/${id}/close`);
export const postReview = (data) => api.post("/api/customer/reviews", data);