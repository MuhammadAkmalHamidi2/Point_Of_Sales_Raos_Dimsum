const { category } = require("../models");

// GET semua kategori
const getCategories = async (req, res) => {
  try {
    const categories = await category.findAll();

    return res.status(200).json({
      success: true,
      message: "Data kategori berhasil diambil",
      data: categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data kategori",
      error: error.message,
    });
  }
};

// GET kategori berdasarkan ID
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const categoryData = await Category.findByPk(id);

    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Kategori berhasil ditemukan",
      data: categoryData,
    });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil kategori",
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
};