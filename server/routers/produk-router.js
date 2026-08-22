const express = require("express");

const {
  getProdukByCategory,
  getProdukById,
} = require("../controllers/produk-controller");

const router = express.Router();

// ==========================================
// GET DETAIL PRODUK
// GET /api/products/detail/1
// ==========================================

router.get("/detail/:id", getProdukById);


// ==========================================
// GET PRODUK BERDASARKAN KATEGORI
// GET /api/products/1
// ==========================================

router.get("/:categoryId", getProdukByCategory);

module.exports = router;