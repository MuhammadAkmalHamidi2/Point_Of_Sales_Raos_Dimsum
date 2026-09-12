const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Import objek db utama untuk penanganan nama model yang lebih aman
const db = require("../models");

// Safeguard penamaan model (mencegah undefined akibat beda huruf kapital/kecil)
const produk = db.produk || db.Produk;
const category = db.category || db.Category;
const topping = db.topping || db.Topping;
const hargaProduk = db.hargaProduk || db.hargaproduk || db.HargaProduk;
const outlet = db.outlet || db.Outlet;
const sequelize = db.sequelize;

// Helper parse JSON string dari FormData
const parseJsonField = (field) => {
  if (!field) return [];
  if (typeof field === "string") {
    try {
      return JSON.parse(field);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(field) ? field : [];
};

// ==========================================
// 1. GET PRODUK KASIR (FILTER BERDASARKAN OUTLET)
// ==========================================
const getProdukKasir = async (req, res) => {
  try {
    const { outletId, categoryId } = req.query;

    const whereClause = {};

    if (outletId) {
      whereClause[Op.or] = [
        { outletId: Number(outletId) },
        { outletId: null }
      ];
    }

    if (categoryId) {
      whereClause.categoryId = Number(categoryId);
    }

    const products = await produk.findAll({
      where: whereClause,
      include: [
        { model: category, as: "category", attributes: ["id", "name"] },
        { model: topping, as: "toppings" },
        { model: hargaProduk, as: "hargaproduks" },
        {
          model: outlet,
          as: "outlet",
          attributes: ["id", "outletName"]
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error pada getProdukKasir:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET semua produk (Admin - Tampilkan Semua Tanpa Filter)
const getAllProdukAdmin = async (req, res) => {
  try {
    const products = await produk.findAll({
      include: [
        { model: category, as: "category", attributes: ["id", "name"] },
        { model: topping, as: "toppings" },
        { model: hargaProduk, as: "hargaproduks" },
        {
          model: outlet,
          as: "outlet",
          attributes: ["id", "outletName"]
        },
      ],
      order: [["id", "ASC"]],
    });
    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error pada getAllProdukAdmin:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET produk berdasarkan Kategori + Filter Outlet
const getProdukByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Log untuk memastikan isi token saat dipanggil
    console.log("=== DEBUG REQ.USER DI CONTROLLER ===");
    console.log(req.user);

    // Ambil outletId dari token JWT (req.user) atau query param
    const targetOutletId = req.user?.outletId ?? req.query.outletId;

    console.log("TARGET OUTLET ID:", targetOutletId);

    const whereClause = {
      categoryId: Number(categoryId)
    };

    // Filter jika outletId ada (contoh: Dika = 2)
    if (targetOutletId !== undefined && targetOutletId !== null && targetOutletId !== "") {
      whereClause[Op.or] = [
        { outletId: Number(targetOutletId) },
        { outletId: null }
      ];
    }

    const products = await produk.findAll({
      where: whereClause,
      include: [
        { model: category, as: "category", attributes: ["id", "name"] },
        { model: topping, as: "toppings" },
        { model: hargaProduk, as: "hargaproduks" },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error pada getProdukByCategory:", error);
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
        { model: outlet, as: "outlet", attributes: ["id", "outletName"] },
      ],
    });
    if (!product) return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error pada getProdukById:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE produk
const createProduk = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { namaProduk, keterangan, categoryId, tenantId, outletId } = req.body;

    const toppings = parseJsonField(req.body.toppings);
    const hargaproduks = parseJsonField(req.body.hargaproduks);

    const produkImg = req.file ? req.file.filename : null;

    const validOutletId = outletId && outletId !== "null" && outletId !== "" ? Number(outletId) : null;
    const validTenantId = tenantId && tenantId !== "null" && tenantId !== "" ? Number(tenantId) : null;

    // 1. Simpan Produk Utama
    const newProduk = await produk.create(
      {
        namaProduk,
        keterangan: keterangan || null,
        categoryId: Number(categoryId),
        tenantId: validTenantId,
        outletId: validOutletId,
        produkImg,
      },
      { transaction: t }
    );

    // 2. Simpan Toppings jika ada
    if (toppings.length > 0) {
      const toppingData = toppings.map((item) => ({
        namaTopping: item.namaTopping,
        harga: Number(item.harga) || 0,
        produkId: newProduk.id,
      }));
      await topping.bulkCreate(toppingData, { transaction: t });
    }

    // 3. Simpan Harga Produk jika ada
    if (hargaproduks.length > 0) {
      const hargaData = hargaproduks.map((item) => ({
        qty: Number(item.qty),
        harga: Number(item.harga) || 0,
        produkId: newProduk.id,
      }));
      await hargaProduk.bulkCreate(hargaData, { transaction: t });
    }

    await t.commit();
    return res.status(201).json({
      success: true,
      message: "Produk berhasil dibuat",
      data: newProduk,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error pada createProduk:", error);

    if (req.file) {
      const filePath = path.join("uploads", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE produk
const updateProduk = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { namaProduk, keterangan, categoryId, tenantId, outletId } = req.body;

    const item = await produk.findByPk(id);
    if (!item) {
      await t.rollback();
      if (req.file) {
        const filePath = path.join("uploads", req.file.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

    let produkImg = item.produkImg;

    if (req.file) {
      if (item.produkImg) {
        const oldPath = path.join("uploads", item.produkImg);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      produkImg = req.file.filename;
    }

    const validOutletId = outletId !== undefined
      ? (outletId && outletId !== "null" && outletId !== "" ? Number(outletId) : null)
      : item.outletId;

    const validTenantId = tenantId !== undefined
      ? (tenantId && tenantId !== "null" && tenantId !== "" ? Number(tenantId) : null)
      : item.tenantId;

    await item.update(
      {
        namaProduk: namaProduk || item.namaProduk,
        keterangan: keterangan !== undefined ? keterangan : item.keterangan,
        categoryId: categoryId ? Number(categoryId) : item.categoryId,
        tenantId: validTenantId,
        outletId: validOutletId,
        produkImg,
      },
      { transaction: t }
    );

    const toppings = parseJsonField(req.body.toppings);
    const hargaproduks = parseJsonField(req.body.hargaproduks);

    await topping.destroy({ where: { produkId: id }, transaction: t });
    await hargaProduk.destroy({ where: { produkId: id }, transaction: t });

    if (toppings.length > 0) {
      const toppingData = toppings.map((tItem) => ({
        namaTopping: tItem.namaTopping,
        harga: Number(tItem.harga) || 0,
        produkId: Number(id),
      }));
      await topping.bulkCreate(toppingData, { transaction: t });
    }

    if (hargaproduks.length > 0) {
      const hargaData = hargaproduks.map((hItem) => ({
        qty: Number(hItem.qty),
        harga: Number(hItem.harga) || 0,
        produkId: Number(id),
      }));
      await hargaProduk.bulkCreate(hargaData, { transaction: t });
    }

    await t.commit();
    return res.status(200).json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: item,
    });
  } catch (error) {
    await t.rollback();
    console.error("Error pada updateProduk:", error);

    if (req.file) {
      const filePath = path.join("uploads", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE produk
const deleteProduk = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const item = await produk.findByPk(id);

    if (!item) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan" });
    }

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
    console.error("Error pada deleteProduk:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Auxiliaries
const getAllSauce = async (req, res) => {
  try {
    const sauces = await topping.findAll({ where: { produkId: req.params.productId } });
    return res.status(200).json({ success: true, data: sauces });
  } catch (error) {
    console.error("Error pada getAllSauce:", error);
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
    console.error("Error pada getAllQty:", error);
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
    console.error("Error pada getHargaByPax:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProdukKasir,
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