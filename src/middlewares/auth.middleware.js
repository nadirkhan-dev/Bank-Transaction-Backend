const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function authMiddleWare(req, res, next) {
  const token = req.cookies.token || req.headers.authrization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.userId);
    req.user = user;

    return next();
  } catch (error) {
    console.error("Something went wrong", error);
    return res.status(401).json({
      message: "Unauthorized access , token is invalid",
    });
  }
}

async function systemUserMiddleWare(req, res, next) {
  const token = req.cookies.token || req.headers.authrization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized access, token is missing",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await userModel.findById(decoded.userId).select("+systemUser");
    if (!req.user.systemUser) {
      return res.status(403).json({
        message: "Forbidden access, system user only",
      });
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error("Something went wrong", error);
    return res.status(401).json({
      message: "Unauthorized access , token is invalid",
    });
  }
}
module.exports = { authMiddleWare, systemUserMiddleWare };
