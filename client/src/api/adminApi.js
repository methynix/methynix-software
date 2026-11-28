import apiClient from "./apiClient";

// Thin wrappers over the signed-in admin API. Each resolves to the `data`
// payload (or the whole body where the response carries extra fields).
const data = (r) => r.data.data;

// Uploads and PDFs can take a while on slow connections.
const SLOW = { timeout: 120000 };

const crud = (path) => ({
  list: (params) => apiClient.get(`/admin/${path}`, { params }).then(data),
  create: (body) => apiClient.post(`/admin/${path}`, body).then(data),
  update: (id, body) => apiClient.patch(`/admin/${path}/${id}`, body).then(data),
  remove: (id) => apiClient.delete(`/admin/${path}/${id}`),
});

export const authApi = {
  changePassword: (body) => apiClient.post("/admin/change-password", body).then((r) => r.data),
};

export const overviewApi = {
  get: () => apiClient.get("/admin/overview").then(data),
  runReminders: () => apiClient.post("/admin/reminders/run").then((r) => r.data),
};

export const remindersApi = {
  ...crud("reminders"),
  sendNow: (id) => apiClient.post(`/admin/reminders/${id}/send`).then((r) => r.data),
};

export const clientsApi = {
  ...crud("clients"),
  get: (id) => apiClient.get(`/admin/clients/${id}`).then((r) => ({ ...r.data.data, storageReady: r.data.storage, finance: r.data.finance })),
  // Returns { data, emailed, emailError } so the UI can report the completion email.
  update: (id, body) => apiClient.patch(`/admin/clients/${id}`, body).then((r) => r.data),
  deliver: (id, body) => apiClient.post(`/admin/clients/${id}/deliver`, body, SLOW).then((r) => r.data),
  uploadFile: (id, body) => apiClient.post(`/admin/clients/${id}/files`, body, SLOW).then(data),
  fileUrl: (id, fileId) => apiClient.get(`/admin/clients/${id}/files/${fileId}/url`).then((r) => r.data.url),
  r2Files: (id, prefix) => apiClient.get(`/admin/clients/${id}/r2-files`, { params: prefix ? { prefix } : {} }).then(data),
  linkFiles: (id, files) => apiClient.post(`/admin/clients/${id}/files/link`, { files }).then(data),
  emailClient: (id, body) => apiClient.post(`/admin/clients/${id}/email`, body, SLOW).then((r) => r.data),
  removeFile: (id, fileId) => apiClient.delete(`/admin/clients/${id}/files/${fileId}`).then(data),
};

export const galleryApi = {
  list: () => apiClient.get("/admin/gallery").then(data),
  upload: (body) => apiClient.post("/admin/gallery", body, SLOW).then(data),
  unlinked: () => apiClient.get("/admin/gallery/unlinked").then(data),
  link: (keys, album) => apiClient.post("/admin/gallery/link", { keys, album }).then(data),
  url: (id, download) => apiClient.get(`/admin/gallery/${id}/url`, { params: download ? { download: 1 } : {} }).then((r) => r.data.url),
  update: (id, body) => apiClient.patch(`/admin/gallery/${id}`, body).then(data),
  remove: (id) => apiClient.delete(`/admin/gallery/${id}`),
};

export const paymentsApi = {
  ...crud("payments"),
  // Resolves to the payment, with the server's `note` (if any) attached.
  create: (body) => apiClient.post("/admin/payments", body).then((r) => Object.assign(r.data.data, { note: r.data.note || "" })),
};

export const settingsApi = {
  getFinance: () => apiClient.get("/admin/settings/finance").then(data),
  setFinance: (body) => apiClient.patch("/admin/settings/finance", body).then(data),
};
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
