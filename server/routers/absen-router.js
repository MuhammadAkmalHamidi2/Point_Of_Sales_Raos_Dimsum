const express = require("express");
const router = express.Router();

const { submitAbsen, getHistoryAbsen, getAllAbsensi } = require("../controllers/absen-controller");
const verifyToken = require("../middlewares/verify-token");
const uploadAbsen = require("../middlewares/uploadAbsen");

// Endpoint POST Absen (Live Foto)
router.post("/", verifyToken, uploadAbsen.single("foto"), submitAbsen);

// Endpoint GET Riwayat Absen User sendiri (kasir)
router.get("/my-history", verifyToken, getHistoryAbsen);
router.get("/all", verifyToken, getAllAbsensi);

module.exports = router;
