const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_KEY);

    console.log("====================================");
    console.log("Connected to DB");
    console.log("====================================");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
