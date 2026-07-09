require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Admin = require("../models/adminModel");

const run = async () => {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env first.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Choose a password with at least 8 characters.");
    process.exit(1);
  }

  await connectDB();

  const hash = await bcrypt.hash(password, 12);

  await Admin.model.findOneAndUpdate(
    { email: email.toLowerCase() },
    { email: email.toLowerCase(), password_hash: hash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin account ready for ${email}.`);
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("Could not create admin account:", err.message);
  process.exit(1);
});
