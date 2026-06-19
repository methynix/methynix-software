const pool = require("../config/db");

exports.get = async () => {
  const { rows } = await pool.query("select maintenance from site_settings where id = 1");
  return rows[0] || { maintenance: false };
};

exports.setMaintenance = async (value) => {
  const { rows } = await pool.query(
    `update site_settings set maintenance = $1, updated_at = now() where id = 1 returning maintenance`,
    [Boolean(value)]
  );
  return rows[0];
};
