import express from "express";
import mysql from "mysql2";

import cors from "cors";
const app = express();
const port = process.env.PORT || 8000;

// Enable CORS for all routes
app.use(cors());
// Add middleware for parsing JSON
app.use(express.json());

// Setup database connection from environment variables
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  queueLimit: 0,
});

console.log(
  "Backend Database connection pool created. host:",
  process.env.DB_HOST
);
console.log(
  "Backend Database connection database is: ",
  process.env.DB_DATABASE
);
app.post("/api/weight", (req, res) => {
  const { username, weight, date } = req.body;
  console.log(username, weight, date);
  try {
    const sql = `INSERT INTO weights (username, weight, date) VALUES (?, ?, ?)`;
    pool.query(sql, [username, weight, date], (err, result) => {
      if (err) {
        res.status(500).send("Error adding weight entry");
        return;
      }
      res.send("Weight added successfully!");
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error adding weight entry");
  }
});

app.get("/api/weights/:username", (req, res) => {
  const username = decodeURIComponent(req.params.username);
  const sql = `SELECT * FROM weights WHERE username = ? ORDER BY date ASC`;
  pool.query(sql, [username], (err, results) => {
    if (err) {
      res.status(500).send("Error retrieving weights");
      return;
    }
    res.json(results);
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    dbConnection: pool.config.connectionConfig.host,
  });
});

app.get("/api/weights/test", (req, res) => {
  const sql = `SELECT * FROM weights`;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).send("Error retrieving weights");
      return;
    }
    res.json(results);
  });
});

let server;
// Check if the module is being required elsewhere or run directly
//if (import.meta.url === `file://${process.argv[1]}`) {
server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
//}

export { app, server, pool };
