const express = require("express");
const verifyToken = require("../middlewares/verify-token");
const verifyRole = require("../middlewares/verify-role");
const { getAnalisa } = require("../controllers/analisa-controller");

const router = express.Router();

router.get("/", verifyToken, verifyRole(["admin", "master"]), getAnalisa);

module.exports = router;
