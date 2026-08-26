const jwt = require("jsonwebtoken");
const db = require("../models");

const KaryawanModel = db.Karyawan || db.karyawan;
const Penjualan = db.penjualan || db.Penjualan;
const UserModel = db.User || db.user || db.users;
const ProdukModel = db.produk || db.Produk || db.produks;
const sequelize = db.sequelize;

const checkoutTransaksi = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { totalBayar, metodePembayaran, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Data keranjang kosong",
      });
    }

    // ----------------------------------------------------
    // AMBIL USER ID DARI TOKEN (req.user ATAU Header Authorization)
    // ----------------------------------------------------
    let userId = req.user?.id;

    if (!userId) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "secret_key_pos_raos",
          );
          userId = decoded.id || decoded.userId;
        } catch (err) {
          await transaction.rollback();
          return res.status(401).json({
            success: false,
            message: "Token tidak valid atau telah kadaluwarsa",
          });
        }
      }
    }

    if (!userId) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: "Sesi kasir tidak ditemukan. Silakan login kembali.",
      });
    }

    const karyawan = await KaryawanModel.findOne({ where: { userId } });
    const outletId = karyawan ? karyawan.outletId : null;

    // 1. Generate Kode Invoice Unik
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoice = `INV-${dateStr}-${randomNum}`;

    // 2. Mapping data keranjang dengan fallback field (mendukung nama field FE & BE)
    const dataPenjualan = items.map((item) => {
      const sausArray = Array.isArray(item.saus || item.sauce)
        ? item.saus || item.sauce
        : item.saus || item.sauce
          ? [item.saus || item.sauce]
          : [];

      return {
        invoice,
        idProduk: Number(item.idProduk || item.productId || item.id || 0),
        userId: Number(userId),
        outletId, 
        namaProduk: item.namaProduk || item.name || "Produk",
        pcs: Number(item.pcs || 1),
        pax: Number(item.pax || 1),
        saus: sausArray,
        subtotal: Number(item.subtotal || item.price * (item.pax || 1) || 0),
        totalBayar: Number(totalBayar),
        metodePembayaran,
      };
    });

    // 3. Simpan semua baris barang sekaligus
    const result = await Penjualan.bulkCreate(dataPenjualan, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Transaksi berhasil disimpan",
      data: {
        invoice,
        kasirId: userId,
        totalBayar,
        metodePembayaran,
        totalItems: result.length,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("CHECKOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memproses transaksi",
      error: error.message,
    });
  }
};

const tampilPenjualanByUserId = async (req, res) => {
  try {
    // Ambil userId dari URL params atau dari middleware auth (JWT)
    const userId = req.params.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID wajib diisi.",
      });
    }

    // Susun array include secara dinamis untuk mencegah error 'Include unexpected'
    const includeOptions = [];

    if (UserModel) {
      includeOptions.push({
        model: UserModel,
        as: "kasir",
        attributes: ["id", "username"],
      });
    }

    if (ProdukModel) {
      includeOptions.push({
        model: ProdukModel,
        as: "produk",
        required: false,
      });
    }

    const dataPenjualan = await Penjualan.findAll({
      where: { userId },
      include: includeOptions,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data penjualan berdasarkan User ID",
      totalItem: dataPenjualan.length,
      data: dataPenjualan,
    });
  } catch (error) {
    console.error("Error pada tampilPenjualanByUserId:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data penjualan.",
      error: error.message,
    });
  }
};

const tampilPenjualanByOutletId = async (req, res) => {
  try {
    const outletId = req.params.outletId;

    if (!outletId) {
      return res.status(400).json({
        success: false,
        message: "Outlet Id wajib diisi",
      });
    }

    const includeOptions = [];

    if (UserModel) {
      includeOptions.push({
        model: UserModel,
        as: "kasir",
        attributes: ["id", "username"],
      });
    }

    if (ProdukModel) {
      includeOptions.push({
        model: ProdukModel,
        as: "produk",
        required: false,
      });
    }

    const dataPenjualan = await Penjualan.findAll({
      where: { outletId },
      include: includeOptions,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil data penjualan berdasarkan Outlet ID",
      totalItem: dataPenjualan.length,
      data: dataPenjualan,
    });
  } catch (error) {
    console.error("Error pada tampilPenjualanByOutletId:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat mengambil data penjualan.",
      error: error.message,
    });
  }
};

const tampilPenjualanByOwner = async (req, res) => {
  
};

module.exports = {
  checkoutTransaksi,
  tampilPenjualanByUserId,
  tampilPenjualanByOutletId,
};
