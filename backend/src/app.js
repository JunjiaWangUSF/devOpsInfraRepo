import express from "express";
import mysql from "mysql2";
import cors from "cors";
import https from "https";
import fs from "fs";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
});

app.post("/weight", (req, res) => {
  const { username, weight, date } = req.body;
  const sql = `INSERT INTO weights (username, weight, date) VALUES (?, ?, ?)`;
  pool.query(sql, [username, weight, date], (err, result) => {
    if (err) {
      res.status(500).send("Error adding weight entry");
      return;
    }
    res.send("Weight added successfully!");
  });
});

app.get("/weights/:username", (req, res) => {
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

app.get("/weights/test", (req, res) => {
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

// SSL/TLS Certificate and Key Paths
const key = fs.readFileSync("./server.key", "utf8");
const cert = fs.readFileSync("./server.cert", "utf8");

const httpsOptions = {
  key: key,
  cert: cert,
};

let server;
if (import.meta.url === `file://${process.argv[1]}`) {
  server = https.createServer(httpsOptions, app).listen(port, () => {
    console.log(`Server is running on HTTPS at port ${port}`);
  });
}

export { app, server, pool };
