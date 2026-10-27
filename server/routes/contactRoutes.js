const express = require("express");
const rateLimit = require("express-rate-limit");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const contactController = require("../controllers/contactController");

const router = express.Router();

const contactLimiter = rateLimit({
  max: 6,
  windowMs: 15 * 60 * 1000,
  message: { status: "fail", message: "Too many messages sent. Please wait a little while before trying again." },
});

router.post(
  "/",
  contactLimiter,
  [
    body("name").trim().notEmpty().withMessage("Please tell us your name."),
    body("email").isEmail().withMessage("Please enter a valid email address."),
    body("message").trim().isLength({ min: 15 }).withMessage("Please add a little more detail."),
  ],
  validate,
  contactController.submit
);

module.exports = router;
