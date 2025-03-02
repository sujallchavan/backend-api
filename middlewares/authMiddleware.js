const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_secret_key"; // Use process.env.JWT_SECRET

module.exports = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ msg: "Access Denied" });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.customer = verified;
    next();
  } catch (error) {
    res.status(400).json({ msg: "Invalid Token" });
  }
};
