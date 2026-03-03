// =============================================
// config/database.js
// =============================================
// This file manages the connection to SQL Server
// using Windows Authentication (no username/password needed)
// =============================================

const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  // Pulling the server and database from .env
  server: process.env.DB_SERVER, 
  database: process.env.DB_NAME,
  
  // ADD THESE TWO LINES:
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD, 

  options: {
    encrypt: false, // Set to false for local dev
    trustServerCertificate: true, // Required for local connections
    enableArithAbort: true,
    // Ensure this is NOT set to true when using user/password
    integratedSecurity: false 
  },
  pool: {
    max: 10,
    min: 0,
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