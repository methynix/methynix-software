import apiClient from "./apiClient";

// Thin wrappers over the signed-in admin API. Each resolves to the `data`
// payload (or the whole body where the response carries extra fields).
const data = (r) => r.data.data;

// Uploads and PDFs can take a while on slow connections.
const SLOW = { timeout: 120000 };

const crud = (path) => ({
  list: () => apiClient.get(`/admin/${path}`).then(data),
  create: (body) => apiClient.post(`/admin/${path}`, body).then(data),
  update: (id, body) => apiClient.patch(`/admin/${path}/${id}`, body).then(data),
  remove: (id) => apiClient.delete(`/admin/${path}/${id}`),
});

export const overviewApi = {
  get: () => apiClient.get("/admin/overview").then(data),
  runReminders: () => apiClient.post("/admin/reminders/run").then((r) => r.data),
};

export const clientsApi = {
  ...crud("clients"),
  get: (id) => apiClient.get(`/admin/clients/${id}`).then((r) => ({ ...r.data.data, storageReady: r.data.storage })),
  // Returns { data, emailed, emailError } so the UI can report the completion email.
  update: (id, body) => apiClient.patch(`/admin/clients/${id}`, body).then((r) => r.data),
  deliver: (id, body) => apiClient.post(`/admin/clients/${id}/deliver`, body, SLOW).then((r) => r.data),
  uploadFile: (id, body) => apiClient.post(`/admin/clients/${id}/files`, body, SLOW).then(data),
  fileUrl: (id, fileId) => apiClient.get(`/admin/clients/${id}/files/${fileId}/url`).then((r) => r.data.url),
  removeFile: (id, fileId) => apiClient.delete(`/admin/clients/${id}/files/${fileId}`).then(data),
};

export const paymentsApi = crud("payments");
export const infrastructureApi = crud("infrastructure");
export const studioApi = crud("studio-projects");
export const notesApi = crud("notes");

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.readAsDataURL(file);
  });
