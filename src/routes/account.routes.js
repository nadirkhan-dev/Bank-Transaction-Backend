const express = require("express");
const authMiddleWare = require("../middlewares/auth.middleware");
const accountController = require("../controller/account.controller");

const router = express.Router();

router.post(
  "/",
  authMiddleWare.authMiddleWare,
  accountController.createAccount,
);

module.exports = router;
