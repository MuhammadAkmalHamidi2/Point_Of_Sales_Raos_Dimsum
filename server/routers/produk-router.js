const express = require("express");
const upload = require("../middlewares/upload");
const {
  getAllProdukAdmin,
  getProdukByCategory,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
  getAllSauce,
  getAllQty,
  getHargaByPax,
} = require("../controllers/produk-controller");

const router = express.Router();

// Route Admin dengan upload middleware
router.get("/all", getAllProdukAdmin);
router.post("/", upload.single("produkImg"), createProduk);
router.put("/:id", upload.single("produkImg"), updateProduk);
router.delete("/:id", deleteProduk);

// Detail & Relasi Produk
router.get("/detail/:id", getProdukById);
router.get("/:productId/sauces", getAllSauce);
router.get("/:productId/qty", getAllQty);
router.get("/:productId/harga", getHargaByPax);
router.get("/category/:categoryId", getProdukByCategory);

module.exports = router;