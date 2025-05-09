import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 8001;

const allowedOrigins = [
  "https://wwww.junjiawangusf.live",
  "https://junjiawangusf.live",
  "https://uat-blue.junjiawangusf.live",
  "https://uat-green.junjiawangusf.live",
  "https://ga-blue.junjiawangusf.live",
  "https://ga-green.junjiawangusf.live",
  // Add other trusted domains
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Enable cookies/auth headers
  })
);

// Enhanced body parser with error handling
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
      try {
        JSON.parse(req.rawBody);
      } catch (e) {
        res.status(400).json({ error: "Invalid JSON payload" });
        throw new Error("Invalid JSON");
      }
    },
    limit: "10mb",
    strict: true,
  })
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Create MySQL connection pool
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
  "Authorization Database connection pool created. host:",
  process.env.DB_HOST
);
console.log(
  "Authorization Database connection database is:",
  process.env.DB_DATABASE
);

// Health check endpoint
app.get("/api/auth/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    dbConnection: pool.pool.config.connectionConfig.host,
  });
});

// Registration endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // In a real application, you would generate a token here
    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS policy violation" });
  }

  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Authorization service running on port ${port}`);
});
