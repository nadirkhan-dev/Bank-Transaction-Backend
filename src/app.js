const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

/**
 * - middlewares for app
 **/
app.use(express.json());
app.use(cookieParser());

// swagger documentation
const setupSwagger = require("./swagger");
setupSwagger(app);

/**
 * - require routes
 **/
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

/**
 * - user use routes
 **/

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);

module.exports = app;
