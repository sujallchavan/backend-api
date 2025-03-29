const mongoose = require("mongoose");

const CustomerRequirementSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    unique: true,
  },
  customer_id: { type: Number, required: true },
  cname: { type: String, required: true },
  pname: { type: String, required: true },
  Part_Name: { type: String, required: true },
  category: {
    type: String,
    enum: ["Hardware", "Electrical", "Mechanical"],
    required: true,
  },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  cpno: { type: String, required: true },
  tv: { type: Number, required: true },
  desc: { type: String, required: true },
  blank_name: { type: String },
  pr: { type: String, required: true },
  av: { type: Number, required: true },
  qs: { type: Date, required: true },
  sop: { type: Date, required: true },
  working_status: {
    type: String,
    enum: ["Pending", "Completed", "Working"],
    default: "Pending",
  },
  pdf_file: { type: String }, // Stores file path
  createdAt: { type: Date, default: () => new Date() },
  isApproved: {
    type: String,
    enum: ["Approved", "Disapproved"],
    default: "Disapproved",
  },
  // ✅ Supplier responses stored properly
  supplierResponses: [
    {
      supplier_Id: { type: Number, required: true }, // ✅ Ensure this is a Number
      status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
        required: true,
      },
    },
  ],
});

// ✅ Ensure unique 4-digit order_id before saving
CustomerRequirementSchema.pre("save", async function (next) {
  if (!this.order_id) {
    let randomId;
    let exists = true;

    do {
      randomId = Math.floor(1000 + Math.random() * 9000);
      exists = await mongoose
        .model("CustomerRequirement")
        .exists({ order_id: randomId });
    } while (exists);

    this.order_id = randomId;
  }

  if (!this.createdAt) {
    this.createdAt = new Date();
  }

  next();
});

module.exports = mongoose.model(
  "CustomerRequirement",
  CustomerRequirementSchema
);
