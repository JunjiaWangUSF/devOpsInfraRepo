import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const app = express();
const port = process.env.PORT || 8001;
const corsOptions = {
  origin: "http://localhost:3000", // <-- Allow ONLY your frontend
  credentials: true, // <-- Allow cookies/auth headers
};

app.use(cors(corsOptions));
// Middleware
app.use(express.json());
// Create MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
});

console.log(
  "Authorization Database connection pool created. host:",
  process.env.DB_HOST
);
console.log(
  "Authorization Database connection database is: ",
  process.env.DB_DATABASE
);
// --- Routes ---

// Registration
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.query("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Authorization server is running 🚀");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
