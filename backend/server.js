const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");

// Route imports
const authRoutes = require("./src/routes/authRoutes");
const groupRoutes = require("./src/routes/groupRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/groups", groupRoutes);
app.use("/suggestion", require("./src/routes/suggestionRoutes"));


// Connect Database
connectDB();

// Test route
app.get("/", (req, res) => {
  res.send("Collaborative Gifting API running");
});

// 🔐 Auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
