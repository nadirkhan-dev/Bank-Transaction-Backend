const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailMailer = require("../services/email.service");
/**
 * - user register controller
 * - POST /api/auth/register
 **/
async function registerUser(req, res) {
  const { name, email, password } = req.body;

  const isExists = await userModel.findOne({
    email: email,
  });
  if (isExists) {
    return res.status(422).json({
      message: "Email already exists",
      status: "failed",
    });
  }

  const user = await userModel.create({
    name,
    email,
    password,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "3d",
  });

  res.cookie("token", token);

  res.status(201).json({
    message: "User created successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });

  await emailMailer.sendRegisterUserEmail(user.email, user.name);
}

/**
 * - user login controller
 * - POST /api/auth/login
 **/
async function loginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(401).json({
      message: "user is not exists",
    });
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(400).json({
      message: "Password did not match",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "3d",
  });

  res.cookie("token", token);

  res.status(200).json({
    message: "User fetch successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
}

module.exports = { registerUser, loginUser };
