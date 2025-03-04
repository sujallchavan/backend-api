const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema({
  customer_id: { type: String, unique: true }, // Add this for unique 4-digit ID
  name: String,
  email: { type: String, unique: true }, // Ensure unique emails
  location: String,
  phone_number: Number,
  password: String,
  isLoggedIn: { type: Boolean, default: false },
});

// Hash password before saving
// customerSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

module.exports = mongoose.model("Customer", customerSchema);
