const express = require("express");
const router = express.Router();
const { 
  uploadFile,
  deleteDocument,
  getPublicViewUsers
} = require("../controller/homeController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/upload", authMiddleware, uploadFile);
router.post("/delete-document", authMiddleware, deleteDocument);
router.get("/public-view", authMiddleware, getPublicViewUsers);

module.exports = router;