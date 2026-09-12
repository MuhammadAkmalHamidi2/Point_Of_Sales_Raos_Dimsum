const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ status: false, message: "Token tidak ditemukan" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Assign payload JWT (yang membawa { id, role, outletId }) langsung ke req.user
    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: "Token tidak valid" });
  }
};

module.exports = verifyToken;