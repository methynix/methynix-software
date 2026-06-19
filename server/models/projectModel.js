const pool = require("../config/db");

exports.all = async () => {
  const { rows } = await pool.query(
    "select id, name, type, summary, url, image_url, created_at from projects order by created_at desc"
  );
  return rows;
};

exports.create = async ({ name, type, summary, url, image_url }) => {
  const { rows } = await pool.query(
    `insert into projects (name, type, summary, url, image_url)
     values ($1, $2, $3, $4, $5)
     returning id, name, type, summary, url, image_url, created_at`,
    [name, type || "web", summary || null, url || null, image_url || null]
  );
  return rows[0];
};

exports.remove = async (id) => {
  await pool.query("delete from projects where id = $1", [id]);
};
