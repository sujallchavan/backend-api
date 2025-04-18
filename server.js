const express = require("express");
const supplierRoutes = require("./routes/supplierRoutes");
const ergoasiaRoutes = require("./routes/ergoasiaRoutes");
const connectDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");

require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB().catch((err) => console.error("MongoDB Connection Error:", err));

// ✅ Updated CORS Configuration
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://127.0.0.1:5512",
      "https://customerergoasia.netlify.app",
      "https://manufacturerfrontend.netlify.app",
      "https://supplyerergoasia.netlify.app", // ✅ Added Netlify frontend
    ],
    credentials: true, // ✅ Allow credentials (cookies, sessions)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // ✅ Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allowed headers
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use(express.urlencoded({ extended: true }));

// ✅ Secure Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.CUSTOMER_DB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // ✅ Secure cookies in production
      httpOnly: true, // ✅ Prevent XSS attacks
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1-day session lifespan
    },
  })
);

// ✅ Debug Middleware: Logs Session Data
app.use((req, res, next) => {
  console.log("Session Middleware Debug:", req.session);
  next();
});

// ✅ Routes
app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/manufacturer", require("./routes/ergoasiaRoutes"));

// ✅ Dynamic PORT Handling
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
