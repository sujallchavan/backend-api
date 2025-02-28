require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB for Each Database
const customerDB = mongoose.createConnection(process.env.CUSTOMER_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const