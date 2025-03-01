const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/supplier", require("./routes/supplierRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
