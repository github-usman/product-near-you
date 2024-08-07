import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { jwtExpire, jwtSecret } from "../config/config.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be greater than 8 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },

  address: {
    type: String,
    default: "",
  },
  mobile_no: {
    type: Number,
    minLength: [10, "Mobile Number should be greater than 10 characters"],
  },
  location: {
    longitude: {
      type: String,
      required: true,
      default: "0.0",
    },
    latitude: {
      type: String,
      required: true,
      default: "0.0",
    },
  },
  role: {
    type: String,
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hashing Password

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// JWT TOKEN GENERATION

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, jwtSecret, {
    expiresIn: jwtExpire,
  });
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generating Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  // Generating Token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hashing and adding resetPasswordToken to userSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};
export const User = mongoose.model("User", userSchema);
