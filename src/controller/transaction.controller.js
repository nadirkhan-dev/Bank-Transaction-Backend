const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const emailService = require("../services/email.service");

async function createTransaction(req, res) {
  /**
   * 1. validate request
   **/
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required fields: fromAccount, toAccount, amount, idempotencyKey",
    });
  }
  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({
      success: false,
      message: "Acoounts not found, Invalid from or to accounts",
    });
  }

  /**
   * 2. validate idempotency key
   **/
  const idempotentTransactionExists = await transactionModel.findOne({
    idempotencyKey,
  });
  if (idempotentTransactionExists) {
    if (idempotentTransactionExists.status === "COMPLETED") {
      return res.status(200).json({
        success: true,
        message: "A transaction with the same idempotency key already exists",
        data: idempotentTransactionExists,
      });
    }
    if (idempotentTransactionExists.status === "PENDING") {
      return res.status(202).json({
        success: true,
        message: "A transaction with the same idempotency key is pending",
        data: idempotentTransactionExists,
      });
    }
    if (idempotentTransactionExists.status === "FAILED") {
      return res.status(500).json({
        success: false,
        message: "A transaction with the same idempotency key has failed",
        data: idempotentTransactionExists,
      });
    }
    if (idempotentTransactionExists.status === "REVERSED") {
      return res.status(200).json({
        success: true,
        message:
          "A transaction with the same idempotency key has been reversed",
        data: idempotentTransactionExists,
      });
    }
  }

  /**
   * 3. check account status
   **/
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Both from and to accounts must be active to create a transaction",
    });
  }

  /**
   * 4. derive sender balance from ledger
   **/
  const senderBalance = await fromUserAccount.getBalance();
  if (senderBalance < amount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance, current balance is ${senderBalance} to complete the transaction`,
    });
  }

  /**
   * 5. CREATE TRANSACTION (Pending)
   **/
  const session = await transactionModel.startSession();
  session.startTransaction();
  const transaction = await transactionModel.create(
    {
      fromAccount,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  /**
   *  - update ledger entries for both accounts
   *  - send email notification to both users
   **/
  const debitEntry = await ledgerModel.create(
    {
      account: fromAccount,
      transaction: transaction._id,
      type: "DEBIT",
      amount,
    },
    { session },
  );
  const creditEntry = await ledgerModel.create(
    {
      account: toAccount,
      transaction: transaction._id,
      type: "CREDIT",
      amount,
    },
    { session },
  );
  transaction.status = "COMPLETED";
  await transaction.save({ session });
  await session.commitTransaction();
  session.endSession();

  // send email notification to both users
  const fromUserEmail = fromUserAccount.user.email;
  const toUserEmail = toUserAccount.user.email;

  emailService.sendTransactionEmail(
    fromUserEmail,
    fromUserAccount.user.name,
    amount,
    toAccount,
  );
  emailService.sendTransactionEmail(
    toUserEmail,
    toUserAccount.user.name,
    amount,
    fromAccount,
  );
  emailService.sendTransactionFailureEmail(
    fromUserEmail,
    fromUserAccount.user.name,
    amount,
    toAccount,
  );

  return res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: transaction,
  });
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: toAccount, amount, idempotencyKey",
    });
  }
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });
  if (!toUserAccount) {
    return res.status(404).json({
      success: false,
      message: "Acoount not found, Invalid to account",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(404).json({
      success: false,
      message: "System account not found",
    });
  }

  const session = await transactionModel.startSession();
  session.startTransaction();
  const transaction = new transactionModel(
    {
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    },
    { session },
  );

  const debitEntry = await ledgerModel.create(
    {
      account: fromUserAccount._id,
      transaction: transaction._id,
      type: "DEBIT",
      amount,
    },
    { session },
  );

  const creditEntry = await ledgerModel.create(
    {
      account: toAccount,
      transaction: transaction._id,
      type: "CREDIT",
      amount,
    },
    { session },
  );
  transaction.status = "COMPLETED";
  await transaction.save({ session });
  await session.commitTransaction();
  session.endSession();
  return res.status(201).json({
    success: true,
    message: "Initial funds transaction created successfully",
    data: transaction,
  });
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
