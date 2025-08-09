const User = require("../models/models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const { fullNames, familyName, email, password, gfgNumber } = req.body;

  try {
    // Validate required fields
    if (!fullNames || !familyName || !email || !password || !gfgNumber) {
      return res.status(400).json({ 
        message: "All fields are required",
        requiredFields: ["fullNames", "familyName", "email", "password", "gfgNumber"]
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate GFG number format
    if (!/^\d{14}$/.test(gfgNumber)) {
      return res.status(400).json({ message: "GFG number must be exactly 14 digits" });
    }

    // Create new user (password hashing is handled in the pre-save hook)
    const user = new User({
      fullNames,
      familyName,
      email,
      password,
      gfgNumber
    });

    await user.save();

    // Generate token (without sensitive fields)
    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      fullNames: user.fullNames,
      familyName: user.familyName,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      message: err.message || "Registration failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check for user (including password which is normally excluded)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data (excluding sensitive fields)
    res.json({
      _id: user._id,
      fullNames: user.fullNames,
      familyName: user.familyName,
      email: user.email,
      profileImage: user.profileImage,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      message: "Authentication failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -gfgNumber -__v');
      
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ 
      message: "Failed to retrieve user data",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
exports.updateUser = async (req, res) => {
  const { fullNames, familyName, email } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields if provided
    if (fullNames) user.fullNames = fullNames;
    if (familyName) user.familyName = familyName;
    if (email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== req.user.id) {
        return res.status(400).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    await user.save();

    res.json({
      _id: user._id,
      fullNames: user.fullNames,
      familyName: user.familyName,
      email: user.email,
      profileImage: user.profileImage,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ 
      message: "Profile update failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password (hashing is handled in pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).json({ 
      message: "Password change failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Upload profile picture
// @route   POST /api/auth/profile-pic
// @access  Private
exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // Clean up the uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old profile pic if exists
    if (user.profileImage && fs.existsSync(user.profileImage)) {
      fs.unlink(user.profileImage, (err) => {
        if (err) console.error("Error deleting old profile image:", err);
      });
    }

    // Update user with new profile pic path
    user.profileImage = req.file.path;
    await user.save();

    res.json({ 
      message: "Profile image updated successfully",
      profileImage: user.profileImage 
    });
  } catch (err) {
    console.error("Profile upload error:", err);
    // Clean up the uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      message: "Profile image upload failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logoutUser = async (req, res) => {
  // In a production app, you would implement token invalidation here
  res.json({ message: "Logout successful" });
};