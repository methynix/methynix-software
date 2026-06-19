const pool = require("../config/db");

exports.create = async ({ name, email, phone, need, message }) => {
  const { rows } = await pool.query(
    `insert into contact_messages (name, email, phone, need, message)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [name, email, phone || null, need || null, message]
  );
  return rows[0];
};
