const pool = require("./db");

async function test() {
  try {
    console.log("Connecting to DB...");
    const res = await pool.query("SELECT NOW()");
    console.log("Connection successful:", res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

test();
