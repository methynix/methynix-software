const express = require("express");
const auth = require("../middleware/auth");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const projectController = require("../controllers/projectController");
const settingsController = require("../controllers/settingsController");
const documentController = require("../controllers/documentController");

const router = express.Router();

router.post("/login", authController.login);

router.use(auth);

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

module.exports = router;
