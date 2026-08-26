const { produk, category, topping, hargaProduk, sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

// Helper untuk parse JSON dari FormData secara aman
const parseJsonField = (field) => {
  if (!field) return [];
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch (e) {
      return [];
    }
  }
  return field;
};

// GET semua produk (Admin)
const getAllProdukAdmin = async (req, res) => {
  try {
    const products = await produk.findAll({
      include: [
        { model: category, as: "category", attributes: ["id", "name"] },
        { model: topping, as: "toppings" },
        { model: hargaProduk, as: "hargaproduks" },
      ],
      order: [["id", "ASC"]],
    });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET produk by Category
const getProdukByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await produk.findAll({
      where: { categoryId },
      include: [
        { model: category, as: "category", attributes: ["id", "name"] },
        { model: topping, as: "toppings" },
        { model: hargaProduk, as: "hargaproduks" },
      ],
      order: [["id", "ASC"]],
    });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET detail produk
const getProdukById = async (req, res) => {
  try {
    const product = await produk.findByPk(req.params.id, {
      include: [
        { model: category, as: "category", attributes: ["id", "name"] },
        { model: topping, as: "toppings" },
        { model: hargaProduk, as: "hargaproduks" },
      ],
    });
    if (!product) return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE produk (beserta upload gambar & relasi)
const createProduk = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { namaProduk, keterangan, categoryId } = req.body;

    const toppings = parseJsonField(req.body.toppings);
    const hargaproduks = parseJsonField(req.body.hargaproduks);

    // Ambil filename dari multer jika ada
    const produkImg = req.file ? req.file.filename : req.body.produkImg || null;

    const newProduk = await produk.create(
      {
        namaProduk,
        keterangan,
        categoryId: Number(categoryId),
        produkImg,
      },
      { transaction: t }
    );

    if (toppings.length > 0) {
      const toppingData = toppings.map((item) => ({
        namaTopping: item.namaTopping,
        harga: Number(item.harga) || 0,
        produkId: newProduk.id,
      }));
      await topping.bulkCreate(toppingData, { transaction: t });
    }

    if (hargaproduks.length > 0) {
      const hargaData = hargaproduks.map((item) => ({
        qty: Number(item.qty),
        harga: Number(item.harga) || 0,
        produkId: newProduk.id,
      }));
      await hargaProduk.bulkCreate(hargaData, { transaction: t });
    }

    await t.commit();
    return res.status(201).json({ success: true, message: "Produk berhasil dibuat", data: newProduk });
  } catch (error) {
    await t.rollback();
    // Hapus file yang terupload jika transaksi gagal
    if (req.file) {
      const filePath = path.join("uploads", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE produk (update gambar & sync relasi)
const updateProduk = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { namaProduk, keterangan, categoryId } = req.body;

    const item = await produk.findByPk(id);
    if (!item) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    let produkImg = item.produkImg;
    if (req.file) {
      // Hapus gambar lama jika ada gambar baru yang diunggah
      if (item.produkImg) {
        const oldPath = path.join("uploads", item.produkImg);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      produkImg = req.file.filename;
    }

    await item.update(
      {
        namaProduk,
        keterangan,
        categoryId: Number(categoryId),
        produkImg,
      },
      { transaction: t }
    );

    // Sync Relasi Toppings & Harga
    const toppings = parseJsonField(req.body.toppings);
    const hargaproduks = parseJsonField(req.body.hargaproduks);

    await topping.destroy({ where: { produkId: id }, transaction: t });
    await hargaProduk.destroy({ where: { produkId: id }, transaction: t });

    if (toppings.length > 0) {
      const toppingData = toppings.map((tItem) => ({
        namaTopping: tItem.namaTopping,
        harga: Number(tItem.harga) || 0,
        produkId: id,
      }));
      await topping.bulkCreate(toppingData, { transaction: t });
    }

    if (hargaproduks.length > 0) {
      const hargaData = hargaproduks.map((hItem) => ({
        qty: Number(hItem.qty),
        harga: Number(hItem.harga) || 0,
        produkId: id,
      }));
      await hargaProduk.bulkCreate(hargaData, { transaction: t });
    }

    await t.commit();
    return res.status(200).json({ success: true, message: "Produk berhasil diperbarui", data: item });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE produk (beserta hapus file & relasi)
const deleteProduk = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const item = await produk.findByPk(id);
    if (!item) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    // Hapus file fisik gambar jika ada
    if (item.produkImg) {
      const filePath = path.join("uploads", item.produkImg);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await topping.destroy({ where: { produkId: id }, transaction: t });
    await hargaProduk.destroy({ where: { produkId: id }, transaction: t });
    await item.destroy({ transaction: t });

    await t.commit();
    return res.status(200).json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Auxiliaries
const getAllSauce = async (req, res) => {
  try {
    const sauces = await topping.findAll({ where: { produkId: req.params.productId } });
    return res.status(200).json({ success: true, data: sauces });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllQty = async (req, res) => {
  try {
    const qtyOptions = await hargaProduk.findAll({
      where: { produkId: req.params.productId },
      order: [["qty", "ASC"]],
    });
    return res.status(200).json({ success: true, data: qtyOptions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getHargaByPax = async (req, res) => {
  try {
    const hargaItem = await hargaProduk.findOne({
      where: { produkId: req.params.productId, qty: Number(req.query.qty) },
    });
    if (!hargaItem) return res.status(404).json({ success: false, message: "Harga tidak ditemukan" });
    return res.status(200).json({ success: true, data: hargaItem });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllProdukAdmin,
  getProdukByCategory,
  getProdukById,
  createProduk,
  updateProduk,
  deleteProduk,
  getAllSauce,
  getAllQty,
  getHargaByPax,
};