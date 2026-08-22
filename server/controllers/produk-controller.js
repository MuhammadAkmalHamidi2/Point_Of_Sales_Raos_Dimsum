const { produk, category } = require("../models");

// GET semua produk berdasarkan kategori
const getProdukByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await produk.findAll({
      where: {
        categoryId: categoryId,
      },
      include: [
        {
          model: category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Data produk berhasil diambil",
      data: products,
    });
  } catch (error) {
    console.error("GET PRODUK BY CATEGORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data produk",
      error: error.message,
    });
  }
};
const getProdukById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await produk.findByPk(id, {
      include: [
        {
          model: category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Produk berhasil ditemukan",
      data: product,
    });

  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil produk",
      error: error.message,
    });
  }
};

module.exports = {
  getProdukByCategory,
  getProdukById
};