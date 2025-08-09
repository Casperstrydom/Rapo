const path = require("path");
const fs = require("fs");
const multer = require("multer");
const User = require("../models/models");

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../uploads");
const profileImageDir = path.join(uploadDir, "profile-images");

// Create directories if they don't exist
[uploadDir, profileImageDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.body.type === "profileImage") {
      cb(null, profileImageDir);
    } else {
      const userDir = path.join(uploadDir, req.user.id);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }
      cb(null, userDir);
    }
  },
  filename: (req, file, cb) => {
    // Preserve folder structure by maintaining relative paths
    const relativePath = file.originalname;
    cb(null, relativePath);
  }
});

// File filter for different upload types
const fileFilter = (req, file, cb) => {
  if (req.body.type === "profileImage") {
    // Only allow image files for profile pictures
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile pictures"), false);
    }
  } else {
    // Allow all file types for folder uploads
    cb(null, true);
  }
};

// Custom multer middleware to handle folder uploads
const folderUpload = (req, res, next) => {
  const upload = multer({
    storage,
    limits: {
      fileSize: req => req.body.type === "profileImage" ? 2 * 1024 * 1024 : 1024 * 1024 * 1024 // 2MB for profile, 1GB for folders
    },
    fileFilter
  }).fields([
    { name: "file", maxCount: 1 }, // For single file uploads (profile)
    { name: "files", maxCount: 1000 } // For folder uploads (large number to accommodate many files)
  ]);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "Folder is too large (maximum 1GB allowed)"
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Upload error",
        error: err.message
      });
    }
    next();
  });
};

exports.uploadFile = async (req, res) => {
  folderUpload(req, res, async () => {
    try {
      const { type, documentType } = req.body;

      // Handle profile image upload
      if (type === "profileImage") {
        if (!req.files || !req.files.file || req.files.file.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No file uploaded"
          });
        }

        const file = req.files.file[0];
        const filePath = `/uploads/profile-images/${file.filename}`;

        // Update user's profile image in database
        await User.findByIdAndUpdate(req.user.id, {
          profileImage: filePath
        });

        return res.status(200).json({
          success: true,
          message: "Profile image uploaded successfully",
          filePath
        });
      }

      // Handle folder/document uploads
      if (!req.files || !req.files.files || req.files.files.length === 0) {
        // Check if this was an empty folder upload
        if (req.body.emptyFolder === 'true') {
          // Create an empty folder marker file
          const emptyFolderPath = path.join(uploadDir, req.user.id, req.body.folderName || 'untitled', '.emptyfolder');
          fs.mkdirSync(path.dirname(emptyFolderPath), { recursive: true });
          fs.writeFileSync(emptyFolderPath, 'This is an empty folder marker');

          return res.status(200).json({
            success: true,
            message: "Empty folder created successfully",
            filePaths: []
          });
        }
        
        return res.status(400).json({
          success: false,
          message: "No files uploaded"
        });
      }

      // Process folder upload
      const filePaths = req.files.files.map(file => {
        return `/uploads/${req.user.id}/${file.filename}`;
      });

      // Update user document requirements
      const update = {};
      if (documentType === "politicalDeclaration") {
        update["documentRequirements.politicalDeclaration"] = filePaths[0];
      } else if (documentType === "witnessTestimonies") {
        update.$push = {
          "documentRequirements.witnessTestimonies": { $each: filePaths }
        };
      } else if (documentType === "idDocument") {
        update["documentRequirements.idDocumentFile"] = filePaths[0];
      } else if (documentType === "folderUpload") {
        // For folder uploads, store the entire folder structure
        update["documentRequirements.folderUpload"] = {
          folderName: req.body.folderName || 'untitled',
          files: filePaths,
          uploadedAt: new Date()
        };
      }

      await User.findByIdAndUpdate(req.user.id, update);

      res.status(200).json({
        success: true,
        message: "Files uploaded successfully",
        filePaths
      });
    } catch (error) {
      console.error("Upload processing error:", error);
      res.status(500).json({
        success: false,
        message: "Server error during file processing",
        error: error.message
      });
    }
  });
};

exports.deleteDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Remove files from storage
    const removeFiles = async paths => {
      if (!paths) return;
      
      // Handle folder deletion
      if (paths.folderName) {
        const folderPath = path.join(__dirname, "..", "uploads", req.user.id, paths.folderName);
        if (fs.existsSync(folderPath)) {
          // Recursively delete folder contents
          const deleteFolderRecursive = (folderPath) => {
            if (fs.existsSync(folderPath)) {
              fs.readdirSync(folderPath).forEach((file) => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                  deleteFolderRecursive(curPath);
                } else {
                  fs.unlinkSync(curPath);
                }
              });
              fs.rmdirSync(folderPath);
            }
          };
          deleteFolderRecursive(folderPath);
        }
        return;
      }

      // Handle single file or array of files
      const pathsArray = Array.isArray(paths) ? paths : [paths];
      for (const filePath of pathsArray) {
        if (filePath) {
          const fullPath = path.join(__dirname, "..", filePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        }
      }
    };

    // Update user data and remove files
    const update = {};
    if (documentType === "politicalDeclaration") {
      await removeFiles(user.documentRequirements?.politicalDeclaration);
      update["documentRequirements.politicalDeclaration"] = null;
    } else if (documentType === "witnessTestimonies") {
      await removeFiles(user.documentRequirements?.witnessTestimonies);
      update["documentRequirements.witnessTestimonies"] = [];
    } else if (documentType === "idDocument") {
      await removeFiles(user.documentRequirements?.idDocumentFile);
      update["documentRequirements.idDocumentFile"] = null;
    } else if (documentType === "folderUpload") {
      await removeFiles(user.documentRequirements?.folderUpload);
      update["documentRequirements.folderUpload"] = null;
    }

    await User.findByIdAndUpdate(req.user.id, update);
    res.json({
      success: true,
      message: "Document/folder deleted successfully"
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during deletion",
      error: error.message
    });
  }
};

exports.getPublicViewUsers = async (req, res) => {
  try {
    const users = await User.find({
      "documentRequirements.politicalDeclaration": { $exists: true, $ne: null },
      "documentRequirements.witnessTestimonies": { $exists: true, $ne: [] },
      "documentRequirements.idDocumentFile": { $exists: true, $ne: null }
    })
      .select("fullNames familyName profileImage documentRequirements")
      .lean();

    res.json({
      success: true,
      users: users.map(user => ({
        ...user,
        profileImage: user.profileImage
          ? `${process.env.BASE_URL || "http://localhost:5000"}${user.profileImage}`
          : null
      }))
    });
  } catch (error) {
    console.error("Public view error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching public records",
      error: error.message
    });
  }
};