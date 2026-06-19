const express = require("express");
const auth = require("../middleware/auth");
const authController = require("../controllers/authController");
const postController = require("../controllers/postController");
const projectController = require("../controllers/projectController");
const settingsController = require("../controllers/settingsController");

const router = express.Router();

router.post("/login", authController.login);

router.use(auth);

router.post("/posts", postController.create);
router.delete("/posts/:id", postController.remove);

router.post("/projects", projectController.create);
router.delete("/projects/:id", projectController.remove);

router.patch("/site", settingsController.setMaintenance);

module.exports = router;
