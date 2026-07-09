import apiClient from "../../api/apiClient";

export const listDocuments = (type) =>
  apiClient
    .get("/admin/documents", { params: type ? { type } : {} })
    .then((r) => r.data.data || []);

export const getNextNumber = (type) =>
  apiClient.get("/admin/documents/next", { params: { type } }).then((r) => r.data.data);

export const createDocument = (payload) =>
  apiClient.post("/admin/documents", payload).then((r) => r.data.data);

export const updateDocument = (id, payload) =>
  apiClient.patch(`/admin/documents/${id}`, payload).then((r) => r.data.data);

export const deleteDocument = (id) =>
  apiClient.delete(`/admin/documents/${id}`).then((r) => r.data);
