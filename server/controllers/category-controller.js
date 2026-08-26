const { category } = require("../models");

// GET semua kategori
const getCategories = async (req, res) => {
  try {
    const categories = await category.findAll({ order: [["id", "ASC"]] });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET kategori by ID
const getCategoryById = async (req, res) => {
  try {
    const categoryData = await category.findByPk(req.params.id);
    if (!categoryData) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }
    return res.status(200).json({ success: true, data: categoryData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE kategori
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Nama kategori wajib diisi" });

    const newCategory = await category.create({ name });
    return res.status(201).json({ success: true, message: "Kategori berhasil dibuat", data: newCategory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE kategori
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const item = await category.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });

    await item.update({ name });
    return res.status(200).json({ success: true, message: "Kategori berhasil diperbarui", data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE kategori
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await category.findByPk(id);
    if (!item) return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });

    await item.destroy();
    return res.status(200).json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};