const mongoose = require("mongoose");

// Function to generate a random four-digit number
const generateSupplierId = () => Math.floor(1000 + Math.random() * 9000);

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  category: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  companyName: { type: String, required: true },
  location: { type: String, required: true },
  supplierId: { type: Number, default: generateSupplierId, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Supplier", SupplierSchema);
