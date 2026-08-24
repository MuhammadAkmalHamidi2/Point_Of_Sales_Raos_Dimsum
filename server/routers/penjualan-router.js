const express = require("express");
const { checkoutTransaksi } = require("../controllers/penjualan-controller");

const router = express.Router();

router.post("/checkout", checkoutTransaksi);

module.exports = router;