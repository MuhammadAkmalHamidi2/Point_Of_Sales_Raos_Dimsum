const express = require("express");
const verifyToken = require("../middlewares/verify-token");
const verifyRole = require("../middlewares/verify-role");
const { getDashboard } = require("../controllers/dashboard-controller");

const router = express.Router();

router.get("/", verifyToken, verifyRole(["admin", "master"]), getDashboard);

module.exports = router;