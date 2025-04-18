// config/db.js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'BasIta@18',
  database: process.env.DB_NAME || 'uber_eats_db',
  connectionLimit: 10
});

module.exports = pool.promise();
