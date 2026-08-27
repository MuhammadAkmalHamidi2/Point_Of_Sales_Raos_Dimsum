const express = require("express");
const verifyToken = require("../middlewares/verify-token");
const verifyRole = require("../middlewares/verify-role");
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category-controller");

const router = express.Router();
router.use(verifyToken, verifyRole(["admin", "master"]));

router.get("/", getCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;