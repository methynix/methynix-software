const express = require("express");
const contactRoutes = require("./contactRoutes");
const adminRoutes = require("./adminRoutes");
const projectController = require("../controllers/projectController");
const postController = require("../controllers/postController");
const settingsController = require("../controllers/settingsController");

const router = express.Router();

router.get("/projects", projectController.list);
router.get("/posts", postController.list);
router.get("/site/status", settingsController.status);
router.use("/contact", contactRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
