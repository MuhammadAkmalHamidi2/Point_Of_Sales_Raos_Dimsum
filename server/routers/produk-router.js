const express = require("express");

const {
  getProdukByCategory,
  getProdukById,
  getAllSauce,
  getAllQty,
  getHargaByPax,
} = require("../controllers/produk-controller");

const router = express.Router();

// Detail Produk
router.get("/detail/:id", getProdukById);

// Endpoint Saus & Harga Dynamic
router.get("/:productId/sauces", getAllSauce);
router.get("/:productId/qty", getAllQty);
router.get("/:productId/harga", getHargaByPax);

// Produk berdasarkan Kategori
router.get("/:categoryId", getProdukByCategory);

module.exports = router;