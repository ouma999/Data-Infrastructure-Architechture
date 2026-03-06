// =============================================
// config/database.js
// =============================================
// Supports both LOCAL and AWS SQL Server
// Change .env values to switch between them
// =============================================
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server:   process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:     1433,

  options: {
    encrypt:                process.env.NODE_ENV === 'production', // true on AWS, false on local
    trustServerCertificate: process.env.NODE_ENV !== 'production', // true on local, false on AWS
    enableArithAbort:       true,
    integratedSecurity:     false
  },
  pool: {
    max:              10,
    min:              0,
    idleTimeoutMillis: 30000
  }
};

let pool;

async function connectDB() {
  try {
    if (pool) return pool;
    console.log(`Attempting to connect to ${dbConfig.database} as ${dbConfig.user}...`);
    pool = await sql.connect(dbConfig);
    console.log('✅ Connected to SQL Server successfully!');
    return pool;
  } catch (err) {
    console.error('❌ DB connection failed!');
    console.error('Error Details:', err.message);
    process.exit(1);
  }
}

function getDB() {
  if (!pool) throw new Error('DB not connected yet');
  return pool;
}

module.exports = { connectDB, getDB, sql };