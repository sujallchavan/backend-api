const mongoose = require("mongoose");

const CustomerRequirementSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    unique: true,
  },
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
  working_status: { type: String, enum: ["pending"], default: "pending" },
  pdf_file: { type: String }, // Stores file path
});

// Generate a random 4-digit unique order ID before saving
CustomerRequirementSchema.pre("save", async function (next) {
  if (!this.order_id) {
    let randomId;
    let exists = true;

    // Ensure unique 4-digit order_id
    do {
      randomId = Math.floor(1000 + Math.random() * 9000); // Generates a number between 1000-9999
      exists = await mongoose
        .model("CustomerRequirement")
        .exists({ order_id: randomId });
    } while (exists);

    this.order_id = randomId;
  }
  next();
});

module.exports = mongoose.model(
  "CustomerRequirement",
  CustomerRequirementSchema
);
