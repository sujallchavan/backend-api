const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone_number: String,
  password: String,
});

module.exports = mongoose.model("Customer", customerSchema);
