const express = require("express");
const router = express.Router();

const { submitAbsen, getHistoryAbsen } = require("../controllers/absen-controller");
const  verifyToken  = require("../middlewares/verify-token");
const uploadAbsen = require("../middlewares/uploadAbsen");

// Endpoint POST Absen (Live Foto)
router.post("/", verifyToken, uploadAbsen.single("foto"), submitAbsen);

// Endpoint GET Riwayat Absen User
router.get("/my-history", verifyToken, getHistoryAbsen);

module.exports = router;