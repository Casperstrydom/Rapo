// server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const paymentRoutes = require("./routes/payment"); // ✅ Import home routes
const path = require("path");
const fs = require("fs");

dotenv.config(); // Load environment variables

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON
app.use(express.urlencoded({ extended: true })); // For form-data

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/payment", paymentRoutes); // ✅ Mount upload route

// Static folder for uploads (optional: to serve files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route for testing
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
