const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const contactController = require("../controllers/contactController");

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Please tell us your name."),
    body("email").isEmail().withMessage("Please enter a valid email address."),
    body("message").trim().isLength({ min: 15 }).withMessage("Please add a little more detail."),
  ],
  validate,
  contactController.submit
);

module.exports = router;
