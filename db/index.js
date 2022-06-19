require("dotenv").config();
const env = process.env;

const { Pool } = require("pg");

/* ------ Build Database Connection ------ */

const pool = new Pool({
  user: env.PG_USER,
  host: env.PG_HOST,
  database: env.PG_DATABASE,
  password: env.PG_PASSWORD,
  port: env.PG_PORT,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = {
  async query(text, params) {
    return await pool.query(text, params);
  }
};