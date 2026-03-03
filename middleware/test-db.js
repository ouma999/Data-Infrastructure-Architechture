const { connectDB, getDB } = require('./config/database');

async function test() {
    console.log("Starting connection test...");
    try {
        const pool = await connectDB();
        const result = await pool.request().query("SELECT @@VERSION as version, DB_NAME() as db");
        
        console.log("--- TEST SUCCESSFUL ---");
        console.log("SQL Version:", result.recordset[0].version);
        console.log("Current DB:", result.recordset[0].db);
        
        process.exit(0);
    } catch (err) {
        console.error("--- TEST FAILED ---");
        console.error(err);
        process.exit(1);
    }
}

test();