const { biayaoperasional } = require("../models");


// ======================================================
// CREATE BIAYA OPERASIONAL
// ======================================================

const createBiayaOperasional = async (req, res) => {
  try {
    console.log("========================================");
    console.log("CREATE BIAYA OPERASIONAL");
    console.log("========================================");

    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const { deskripsi, biaya, tanggal } = req.body;

    // ------------------------------------------
    // VALIDASI
    // ------------------------------------------

    if (!deskripsi || !deskripsi.trim()) {
      return res.status(400).json({
        success: false,
        message: "Deskripsi operasional wajib diisi",
      });
    }

    if (
      biaya === undefined ||
      biaya === null ||
      Number(biaya) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Biaya harus lebih dari 0",
      });
    }

    // ------------------------------------------
    // AMBIL USER
    // ------------------------------------------

    const user = req.user;

    if (!user) {
      console.log("❌ req.user tidak ditemukan");

      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi",
      });
    }

    // ------------------------------------------
    // OUTLET ID
    // ------------------------------------------

    const outletId =
      user.outletId ||
      user.outlet_id ||
      user.idOutlet;

    if (!outletId) {
      console.log(
        "❌ Outlet ID tidak ditemukan dari user:",
        user
      );

      return res.status(400).json({
        success: false,
        message: "Outlet user tidak ditemukan",
      });
    }

    // ------------------------------------------
    // USER ID
    // ------------------------------------------

    const userId =
      user.id ||
      user.userId;

    if (!userId) {
      console.log(
        "❌ User ID tidak ditemukan:",
        user
      );

      return res.status(400).json({
        success: false,
        message: "User ID tidak ditemukan",
      });
    }

    // ------------------------------------------
    // TANGGAL
    // ------------------------------------------

    const tanggalOperasional =
      tanggal ||
      new Date().toISOString().split("T")[0];

    // ------------------------------------------
    // CREATE
    // ------------------------------------------

    const data =
      await biayaoperasional.create({
        outletId: Number(outletId),
        userId: Number(userId),
        tanggal: tanggalOperasional,
        deskripsi: deskripsi.trim(),
        biaya: Number(biaya),
      });

    console.log(
      "✅ BIAYA OPERASIONAL BERHASIL DIBUAT"
    );

    console.log("DATA:", data.toJSON());

    return res.status(201).json({
      success: true,
      message:
        "Biaya operasional berhasil ditambahkan",
      data,
    });

  } catch (error) {
    console.log(
      "❌ CREATE BIAYA OPERASIONAL ERROR:"
    );

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal menambahkan biaya operasional",
      error: error.message,
    });
  }
};


// ======================================================
// GET BIAYA OPERASIONAL HARI INI
// ======================================================

const getBiayaOperasionalHariIni = async (
  req,
  res
) => {
  try {
    console.log("========================================");
    console.log("GET BIAYA OPERASIONAL HARI INI");
    console.log("========================================");

    console.log("USER:", req.user);

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belum terautentikasi",
      });
    }

    const outletId =
      user.outletId ||
      user.outlet_id ||
      user.idOutlet;

    if (!outletId) {
      return res.status(400).json({
        success: false,
        message: "Outlet tidak ditemukan",
      });
    }

    const tanggal =
      req.query.tanggal ||
      new Date().toISOString().split("T")[0];

    console.log("Outlet ID:", outletId);
    console.log("Tanggal:", tanggal);

    const data =
      await biayaoperasional.findAll({
        where: {
          outletId: Number(outletId),
          tanggal,
        },

        order: [
          ["createdAt", "DESC"],
        ],
      });

    const total = data.reduce(
      (acc, item) =>
        acc + Number(item.biaya),
      0
    );

    console.log(
      "Jumlah transaksi:",
      data.length
    );

    console.log(
      "Total operasional:",
      total
    );

    return res.json({
      success: true,
      data,
      total,
    });

  } catch (error) {
    console.log(
      "❌ GET BIAYA OPERASIONAL ERROR:"
    );

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal mengambil biaya operasional",
      error: error.message,
    });
  }
};


// ======================================================
// DELETE BIAYA OPERASIONAL
// ======================================================

const deleteBiayaOperasional = async (
  req,
  res
) => {
  try {
    console.log("========================================");
    console.log("DELETE BIAYA OPERASIONAL");
    console.log("========================================");

    const { id } = req.params;

    const user = req.user;

    console.log("ID:", id);
    console.log("USER:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belum login",
      });
    }

    const outletId =
      user.outletId ||
      user.outlet_id ||
      user.idOutlet;

    const data =
      await biayaoperasional.findOne({
        where: {
          id,
          outletId: Number(outletId),
        },
      });

    if (!data) {
      return res.status(404).json({
        success: false,
        message:
          "Biaya operasional tidak ditemukan",
      });
    }

    await data.destroy();

    console.log(
      "✅ Biaya operasional berhasil dihapus"
    );

    return res.json({
      success: true,
      message:
        "Biaya operasional berhasil dihapus",
    });

  } catch (error) {
    console.log(
      "❌ DELETE BIAYA OPERASIONAL ERROR:"
    );

    console.log(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal menghapus biaya operasional",
      error: error.message,
    });
  }
};


module.exports = {
  createBiayaOperasional,
  getBiayaOperasionalHariIni,
  deleteBiayaOperasional,
};