const express = require("express");
const { 
  checkoutTransaksi, 
  tampilPenjualanByUserId,
  tampilPenjualanByOutletId,
} = require("../controllers/penjualan-controller");

// Pastikan menyamakan dengan nama file sebenarnya di folder middleware
const verifyToken = require("../middlewares/verify-token"); 

const router = express.Router();

router.post("/checkout", verifyToken, checkoutTransaksi);
router.get("/user/:userId", verifyToken, tampilPenjualanByUserId);
router.get("/my-history", verifyToken, tampilPenjualanByUserId);
router.get("/outlet/:outletId", verifyToken, tampilPenjualanByOutletId);

module.exports = router;