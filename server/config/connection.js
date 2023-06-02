const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});
const pool2 = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.APILOG_DB_NAME,
  port: process.env.DATABASE_PORT,
  password: process.env.DATABASE_PASSWORD,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

module.exports = { pool, pool2 };
