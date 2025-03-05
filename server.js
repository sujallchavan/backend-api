const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config();

const app = express();
connectDB();

app.use(
  cors({
    origin: "http://127.0.0.1:5500", // ✅ Allow frontend URL
    credentials: true, // ✅ Allow cookies & sessions
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "3422db72da5022f2a2854369b3a3d48ebbb81234a99620174ffb78e97a123d9c", // ✅ Secure secret
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.CUSTOMER_DB_URI, // ✅ MongoDB connection
      collectionName: "sessions", // ✅ Explicitly set collection name
    }),
    cookie: {
      secure: false, // ❌ Change to true for HTTPS
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1-day session lifespan
    },
  })
);

// ✅ Debug: Log session on every request
app.use((req, res, next) => {
  console.log("Session Middleware Debug:", req.session);
  next();
});

// 3422db72da5022f2a2854369b3a3d48ebbb81234a99620174ffb78e97a123d9c

app.use("/api/customer", require("./routes/customerRoutes"));

app.use("/api/supplier", require("./routes/supplierRoutes"));

const PORT = process.env.PORT || 5000; // ✅ Dynamic port selection
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
