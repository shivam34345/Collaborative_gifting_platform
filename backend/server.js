const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./src/config/db");

// Route imports
const authRoutes = require("./src/routes/authRoutes");
const groupRoutes = require("./src/routes/groupRoutes");
const contributionRoutes = require("./src/routes/contributionRoutes");
const giftRoutes = require("./src/routes/giftRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/gifts", giftRoutes);
app.use("/api/contribution", contributionRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("Collaborative Gifting API running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
