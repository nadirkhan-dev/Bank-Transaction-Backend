const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating user"],
      trim: true,
      unique: [true, "Email already exists"],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address."],
    },
    name: {
      type: String,
      required: [true, "Name is required for creating an account"],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required for creating an account"],
      minlength: [6, "password should contain more then 6 chracter"],
      select: false,
    },
    systemUser: {
      type: Boolean,
      default: false,
      immutable: true,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;

  return;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
