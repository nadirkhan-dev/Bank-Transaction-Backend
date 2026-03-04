const { Router } = require("express");

const TransactionRoutes = Router();

const transactionController = require("../controller/transaction.controller");
const authMiddleWare = require("../middlewares/auth.middleware");

TransactionRoutes.post(
  "/",
  authMiddleWare.authMiddleWare,
  transactionController.createTransaction,
);

TransactionRoutes.post(
  "/system/initial-funds",
  authMiddleWare.systemUserMiddleWare,
  transactionController.createInitialFundsTransaction,
);
module.exports = TransactionRoutes;
