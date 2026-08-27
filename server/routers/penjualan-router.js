const express = require("express");
const { 
  checkoutTransaksi, 
  tampilPenjualanByUserId,
  tampilPenjualanByOutletId,
} = require("../controllers/penjualan-controller");
const verifyToken = require("../middlewares/verify-token"); 
const verifyRole = require("../middlewares/verify-role");

const router = express.Router();

router.post("/checkout", verifyToken, verifyRole(["kasir"]), checkoutTransaksi);
router.get("/my-history", verifyToken, tampilPenjualanByUserId);
router.get("/user/:userId", verifyToken, verifyRole(["admin", "master"]), tampilPenjualanByUserId);
router.get("/outlet/:outletId", verifyToken, verifyRole(["admin", "master"]), tampilPenjualanByOutletId);

module.exports = router;