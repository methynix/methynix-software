const pool = require("../config/db");

exports.findByEmail = async (email) => {
  const { rows } = await pool.query(
    "select id, email, password_hash from admin_users where email = $1",
    [email.toLowerCase()]
  );
  return rows[0] || null;
};
