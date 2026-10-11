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
const crudController = require("../controllers/crudController");
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

router.post("/login", loginLimiter, authController.login);

router.use(auth);

const crudRoutes = (path, controller) => {
  router.get(path, controller.list);
  router.post(path, controller.create);
  router.patch(`${path}/:id`, controller.update);
  router.delete(`${path}/:id`, controller.remove);
};

router.get("/overview", overviewController.overview);
router.post("/reminders/run", overviewController.runReminders);

router.post("/posts", postController.create);
router.delete("/posts/:id", postController.remove);

router.post("/projects", projectController.create);
router.delete("/projects/:id", projectController.remove);

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
router.get("/clients/:id/files/:fileId/url", clientProjectController.fileUrl);
router.delete("/clients/:id/files/:fileId", clientProjectController.removeFile);

crudRoutes("/payments", paymentController);
crudRoutes("/infrastructure", crudController(Infrastructure, { label: "item", required: ["name"] }));
crudRoutes("/studio-projects", crudController(StudioProject, { label: "project", required: ["name"] }));
crudRoutes("/notes", crudController(Note, { label: "note" }));

module.exports = router;
