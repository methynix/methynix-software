require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("../config/db");

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

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `insert into admin_users (email, password_hash)
     values ($1, $2)
     on conflict (email) do update set password_hash = excluded.password_hash`,
    [email.toLowerCase(), hash]
  );

  console.log(`Admin account ready for ${email}.`);
  await pool.end();
  process.exit(0);
};

run().catch((err) => {
  console.error("Could not create admin account:", err.message);
  process.exit(1);
});
