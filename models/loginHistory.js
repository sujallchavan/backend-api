const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema({
  email: String,
  login_time: { type: Date, default: Date.now },
  ipAddress: String,
});

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);

module.exports = LoginHistory;
