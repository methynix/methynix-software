const express = require("express");
const rateLimit = require("express-rate-limit");
const auth = require("../middleware/auth");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const projectController = require("../controllers/projectController");
const settingsController = require("../controllers/settingsController");
const documentController = require("../controllers/documentController");
const clientProjectController = require("../controllers/clientProjectController");
const paymentController = require("../controllers/paymentController");
const overviewController = require("../controllers/overviewController");
const reminderController = require("../controllers/reminderController");
const crudController = require("../controllers/crudController");
const galleryController = require("../controllers/galleryController");
const uploadController = require("../controllers/uploadController");
const Infrastructure = require("../models/infrastructureModel");
const StudioProject = require("../models/studioProjectModel");
const Note = require("../models/noteModel");

const router = express.Router();

// Login keeps a tight limit against password guessing.
const loginLimiter = rateLimit({
  max: 20,
  windowMs: 15 * 60 * 1000,
  message: { status: "fail", message: "Too many sign-in attempts. Please try again later." },
});

// Password change limiter to prevent brute force
const passwordLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: { status: "fail", message: "Too many password change attempts. Please wait a while." },
});

router.post("/login", loginLimiter, authController.login);

router.use(auth);

router.post("/change-password", passwordLimiter, authController.changePassword);

const crudRoutes = (path, controller) => {
  router.get(path, controller.list);
  router.post(path, controller.create);
  router.patch(`${path}/:id`, controller.update);
  router.delete(`${path}/:id`, controller.remove);
};

router.get("/overview", overviewController.overview);
router.post("/reminders/run", overviewController.runReminders);

// Custom scheduled reminders
router.get("/reminders", reminderController.list);
router.post("/reminders", reminderController.create);
router.get("/reminders/:id", reminderController.getOne);
router.patch("/reminders/:id", reminderController.update);
router.delete("/reminders/:id", reminderController.remove);
router.post("/reminders/:id/send", reminderController.sendNow);

router.post("/posts", postController.create);
router.delete("/posts/:id", postController.remove);

router.post("/projects", projectController.create);
router.delete("/projects/:id", projectController.remove);

router.post("/upload", uploadController.uploadImage);

router.get("/settings/finance", settingsController.getFinance);
router.patch("/settings/finance", settingsController.setFinance);
router.patch("/site", settingsController.setMaintenance);

router.get("/documents", documentController.list);
router.get("/documents/next", documentController.nextNumber);
router.get("/documents/:id", documentController.getOne);
router.post("/documents", documentController.create);
router.patch("/documents/:id", documentController.update);
router.delete("/documents/:id", documentController.remove);

router.get("/clients", clientProjectController.list);
router.post("/clients", clientProjectController.create);
router.get("/clients/:id", clientProjectController.getOne);
router.patch("/clients/:id", clientProjectController.update);
router.delete("/clients/:id", clientProjectController.remove);
router.post("/clients/:id/deliver", clientProjectController.deliver);
router.post("/clients/:id/files", clientProjectController.uploadFile);
router.get("/clients/:id/r2-files", clientProjectController.r2Files);
router.post("/clients/:id/files/link", clientProjectController.linkFiles);
router.post("/clients/:id/email", clientProjectController.emailClient);
router.get("/clients/:id/files/:fileId/url", clientProjectController.fileUrl);
router.delete("/clients/:id/files/:fileId", clientProjectController.removeFile);

router.get("/gallery", galleryController.list);
router.post("/gallery", galleryController.upload);
router.get("/gallery/unlinked", galleryController.unlinked);
router.post("/gallery/link", galleryController.link);
router.get("/gallery/:id/url", galleryController.url);
router.patch("/gallery/:id", galleryController.update);
router.delete("/gallery/:id", galleryController.remove);

crudRoutes("/payments", paymentController);
crudRoutes("/infrastructure", crudController(Infrastructure, { label: "item", required: ["name"] }));
crudRoutes("/studio-projects", crudController(StudioProject, { label: "project", required: ["name"] }));
crudRoutes("/notes", crudController(Note, { label: "note" }));

module.exports = router;
