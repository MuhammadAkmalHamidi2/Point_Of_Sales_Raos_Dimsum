const express = require("express");

const {
  getCategories,
  getCategoryById,
} = require("../controllers/category-controller");

const router = express.Router();


// GET semua kategori
// /api/categories

router.get("/", getCategories);


// GET kategori berdasarkan ID
// /api/categories/1

router.get("/:id", getCategoryById);


module.exports = router;