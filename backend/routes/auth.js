const express = require("express");
const router = express.Router();
const { 
  registerUser, 
  loginUser,
  getUserData,
  updateUser
} = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/me - Get current user data
router.get("/me", authMiddleware, getUserData);

// PUT /api/auth/update - Update user data
router.put("/update", authMiddleware, updateUser);

module.exports = router;