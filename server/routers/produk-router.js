const express = require("express");
const upload = require("../middlewares/upload");
const verifyToken = require("../middlewares/verify-token");
const verifyRole = require("../middlewares/verify-role");
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
const adminAccess = [verifyToken, verifyRole(["admin", "master"])]

router.get("/all", ...adminAccess, getAllProdukAdmin);
router.post("/", ...adminAccess, upload.single("produkImg"), createProduk);
router.put("/:id", ...adminAccess, upload.single("produkImg"), updateProduk);
router.delete("/:id", ...adminAccess, deleteProduk);
router.get("/detail/:id", ...adminAccess, getProdukById);
router.get("/:productId/sauces", ...adminAccess, getAllSauce);
router.get("/:productId/qty", ...adminAccess, getAllQty);
router.get("/:productId/harga", ...adminAccess, getHargaByPax);
router.get("/category/:categoryId", ...adminAccess, getProdukByCategory);

module.exports = router;