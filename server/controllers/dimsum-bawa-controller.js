const { DimsumBawa, category } = require("../models");

// 1. Buat atau Update Dimsum Dibawa per Kasir/Karyawan
const createDimsumBawa = async (req, res) => {
  try {
    const { categoryId, category_id, jumlahPcs, jumlah_bawa } = req.body;

    const targetCategoryId = categoryId || category_id;
    const rawJumlah = jumlahPcs !== undefined ? jumlahPcs : jumlah_bawa;
    const validJumlahBawa = Number(rawJumlah);

    // Ambil karyawan_id jika ada, fallback ke user.id
    const karyawanId = req.user?.karyawan?.id || req.user?.id || null;

    if (!targetCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID wajib diisi",
      });
    }

    if (
      rawJumlah === undefined ||
      rawJumlah === null ||
      rawJumlah === "" ||
      isNaN(validJumlahBawa) ||
      validJumlahBawa < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Jumlah dimsum dibawa harus berupa angka valid",
      });
    }

    const todayStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    let record = await DimsumBawa.findOne({
      where: {
        category_id: targetCategoryId,
        tanggal: todayStr,
        karyawan_id: karyawanId,
      },
    });

    if (record) {
      record.jumlah_bawa = validJumlahBawa;
      await record.save();
    } else {
      record = await DimsumBawa.create({
        category_id: targetCategoryId,
        jumlah_bawa: validJumlahBawa,
        tanggal: todayStr,
        karyawan_id: karyawanId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data dimsum dibawa berhasil disimpan",
      data: record,
    });
  } catch (error) {
    console.error("Error createDimsumBawa:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat menyimpan data",
      error: error.message,
    });
  }
};

// 2. Ambil Data Dimsum Dibawa Hari Ini Khusus Kasir/Karyawan Login
const getDimsumBawaHariIni = async (req, res) => {
  try {
    const todayStr = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });

    const karyawanId = req.user?.karyawan?.id || req.user?.id || null;

    const whereClause = { tanggal: todayStr };
    if (karyawanId) {
      whereClause.karyawan_id = karyawanId;
    }

    const list = await DimsumBawa.findAll({
      where: whereClause,
      include: [
        {
          model: category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Error getDimsumBawaHariIni:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data dimsum dibawa",
      error: error.message,
    });
  }
};

// 3. Ambil Semua Data Dimsum Dibawa Berdasarkan Outlet ID
const getAllDimsumBawaPerOutletId = async (req, res) => {
  try {
    const { outletId } = req.params;
    const { tanggal } = req.query; // Opsional: jika ingin memfilter tanggal tertentu lewat query param ?tanggal=YYYY-MM-DD

    if (!outletId) {
      return res.status(400).json({
        success: false,
        message: "Outlet ID wajib diisi",
      });
    }

    const whereClause = { outlet_id: outletId };

    if (tanggal) {
      whereClause.tanggal = tanggal;
    }

    const list = await DimsumBawa.findAll({
      where: whereClause,
      include: [
        {
          model: category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    console.error("Error getAllDimsumBawaPerOutletId:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data dimsum dibawa per outlet",
      error: error.message,
    });
  }
};

// 4. Update Dimsum Dibawa Berdasarkan ID
const updateDimsumBawa = async (req, res) => {
  try {
    const { id } = req.params;
    const { jumlahPcs, jumlah_bawa } = req.body;

    const rawJumlah = jumlahPcs !== undefined ? jumlahPcs : jumlah_bawa;
    const validJumlahBawa = Number(rawJumlah);

    if (
      rawJumlah === undefined ||
      rawJumlah === null ||
      rawJumlah === "" ||
      isNaN(validJumlahBawa) ||
      validJumlahBawa < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Jumlah dimsum dibawa harus berupa angka valid",
      });
    }

    const record = await DimsumBawa.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Data dimsum dibawa tidak ditemukan",
      });
    }

    record.jumlah_bawa = validJumlahBawa;
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Data dimsum dibawa berhasil diperbarui",
      data: record,
    });
  } catch (error) {
    console.error("Error updateDimsumBawa:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui data dimsum dibawa",
      error: error.message,
    });
  }
};

// 5. Hapus Data Dimsum Dibawa
const deleteDimsumBawa = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await DimsumBawa.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan",
      });
    }

    await record.destroy();
    return res.status(200).json({
      success: true,
      message: "Data dimsum dibawa berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleteDimsumBawa:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus data",
      error: error.message,
    });
  }
};

module.exports = {
  createDimsumBawa,
  getDimsumBawaHariIni,
  getAllDimsumBawaPerOutletId,
  updateDimsumBawa,
  deleteDimsumBawa,
};