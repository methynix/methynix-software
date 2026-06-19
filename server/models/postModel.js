const pool = require("../config/db");

exports.all = async () => {
  const { rows } = await pool.query(
    "select id, title, body, image_url, created_at from posts order by created_at desc"
  );
  return rows;
};

exports.create = async ({ title, body, image_url }) => {
  const { rows } = await pool.query(
    `insert into posts (title, body, image_url)
     values ($1, $2, $3)
     returning id, title, body, image_url, created_at`,
    [title, body, image_url || null]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await pool.query("delete from posts where id = $1", [id]);
};
