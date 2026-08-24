const { produk, category, topping, hargaProduk } = require("../models");

// ==========================================
// GET SEMUA PRODUK BERDASARKAN KATEGORI
// ==========================================
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
        {
          model: topping,
          as: "toppings",
        },
        {
          model: hargaProduk,
          as: "hargaproduks",
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

// ==========================================
// GET DETAIL PRODUK BY ID (TERMASUK TOPPING & HARGA)
// ==========================================
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
        {
          model: topping,
          as: "toppings",
        },
        {
          model: hargaProduk,
          as: "hargaproduks",
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

// ==========================================
// GET SAUS / TOPPING BERDASARKAN PRODUK
// ==========================================
const getAllSauce = async (req, res) => {
  try {
    const { productId } = req.params;

    const sauces = await topping.findAll({
      where: { produkId: productId },
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data saus",
      data: sauces,
    });
  } catch (error) {
    console.error("GET ALL SAUCE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data saus",
      error: error.message,
    });
  }
};

// ==========================================
// GET OPSI QTY & HARGA BERDASARKAN PRODUK
// ==========================================
const getAllQty = async (req, res) => {
  try {
    const { productId } = req.params;

    const qtyOptions = await hargaProduk.findAll({
      where: { produkId: productId },
      order: [["qty", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil opsi Qty",
      data: qtyOptions,
    });
  } catch (error) {
    console.error("GET ALL QTY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil opsi Qty",
      error: error.message,
    });
  }
};

// ==========================================
// GET HARGA BERDASARKAN QTY / PAX
// ==========================================
const getHargaByPax = async (req, res) => {
  try {
    const { productId } = req.params;
    const { qty } = req.query;

    const hargaItem = await hargaProduk.findOne({
      where: {
        produkId: productId,
        qty: Number(qty),
      },
    });

    if (!hargaItem) {
      return res.status(404).json({
        success: false,
        message: "Harga untuk Qty tersebut tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil harga per pax",
      data: hargaItem,
    });
  } catch (error) {
    console.error("GET HARGA BY PAX ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil harga per pax",
      error: error.message,
    });
  }
};

module.exports = {
  getProdukByCategory,
  getProdukById,
  getAllSauce,
  getAllQty,
  getHargaByPax,
};