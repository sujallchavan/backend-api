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

const PORT = process.env.PORT || 5000; // ✅ Dynamic port selection
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
