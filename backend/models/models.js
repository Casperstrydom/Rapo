const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Subschema for document verification (now optional)
const documentSchema = new mongoose.Schema({
  politicalDeclaration: { type: String }, // File path or URL
  witnessTestimonies: [{ type: String }], // Array of file paths
  idDocument: {
    type: String,
    enum: ["DriverLicense", "Passport", "NationalID"],
  },
  idDocumentFile: { type: String }, // File path or URL
  photoWithWhiteBg: { type: String }, // File path
  redThumbprint: { type: String }, // File path
  utilityBill: { type: String }, // File path
  isEmptyFolder: { type: Boolean, default: false }, // Track if empty folder was uploaded
  uploadedAt: { type: Date, default: Date.now } // Track when upload occurred
}, { _id: false });

// Main User schema - simplified for registration
const userSchema = new mongoose.Schema({
  fullNames: { 
    type: String, 
    required: [true, "Full names are required"],
    trim: true
  },
  familyName: { 
    type: String, 
    required: [true, "Family name is required"],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please enter a valid email"]
  },
  password: { 
    type: String, 
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false // Never return password in queries
  },
  gfgNumber: { 
    type: String, 
    required: [true, "GFG number is required"],
    validate: {
      validator: function(v) {
        return /^\d{14}$/.test(v); // Exactly 14 digits
      },
      message: props => `GFG number must be exactly 14 digits`
    },
    select: false // Never return GFG number in queries
  },
  // Made document fields optional
  documentLabel: {
    type: String,
    enum: ["528", "928", "Praecipe"],
    required: false
  },
  documentRequirements: {
    type: documentSchema,
    required: false
  },
  profileImage: { type: String },
  // Additional fields that might be useful
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hash password and gfgNumber before saving
userSchema.pre("save", async function (next) {
  try {
    // Only hash if modified (or new)
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }

    if (this.isModified("gfgNumber")) {
      const salt = await bcrypt.genSalt(12);
      this.gfgNumber = await bcrypt.hash(this.gfgNumber, salt);
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Compare methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.compareGfgNumber = async function (candidateGfgNumber) {
  return bcrypt.compare(candidateGfgNumber, this.gfgNumber);
};

// Indexes for better query performance
userSchema.index({ email: 1 }); // Unique index already created by unique: true
userSchema.index({ fullNames: 1, familyName: 1 });

module.exports = mongoose.model("User", userSchema);