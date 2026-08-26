const { Outlet, Karyawan, User, sequelize } = require("../models");

function ownerFilter(req) {
  return req.user.role === "master" ? {} : { userId: req.user.id };
}

function outletFilter(req, outletId) {
  if (req.user.role === "master") return { id: outletId };
  return { id: outletId, userId: req.user.id };
}

const getOutlets = async (req, res) => {
  try {
    const outlets = await Outlet.findAll({
      where: ownerFilter(req),
      include: [
        {
          model: Karyawan,
          as: "karyawans",
          attributes: ["id", "name", "category", "phone"],
        },
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Data outlet berhasil diambil",
      data: outlets,
    });
  } catch (error) {
    console.error("GET OUTLETS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data outlet",
      error: error.message,
    });
  }
};

const getOutletById = async (req, res) => {
  try {
    const outlet = await Outlet.findOne({
      where: outletFilter(req, req.params.id),
      include: [
        {
          model: Karyawan,
          as: "karyawans",
          attributes: ["id", "name", "category", "phone"],
        },
        { model: User, as: "user", attributes: ["id", "username"] },
      ],
    });

    if (!outlet) {
      return res
        .status(404)
        .json({ success: false, message: "Tenant tidak ditemukan" });
    }

    return res.status(200).json({
      success: true,
      message: "Detail tenant berhasil diambil",
      data: outlet,
    });
  } catch (error) {
    console.error("GET OUTLET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail tenant",
      error: error.message,
    });
  }
};

const createOutlet = async (req, res) => {
  try {
    const { outletName, address, status = true } = req.body;
    if (!outletName?.trim() || !/[a-z0-9]/i.test(outletName)) {
      return res
        .status(400)
        .json({ success: false, message: "Nama tenant wajib diisi" });
    }

    const outlet = await Outlet.create({
      outletName: outletName.trim(),
      address: address?.trim() || null,
      status: Boolean(status),
      userId: req.user.id,
    });

    return res
      .status(201)
      .json({ success: true, message: "Tenant berhasil dibuat", data: outlet });
  } catch (error) {
    console.error("CREATE OUTLET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal membuat tenant",
      error: error.message,
    });
  }
};

const updateOutlet = async (req, res) => {
  try {
    const outlet = await Outlet.findOne({
      where: outletFilter(req, req.params.id),
    });
    if (!outlet) {
      return res
        .status(404)
        .json({ success: false, message: "Tenant tidak ditemukan" });
    }

    const { outletName, address, status } = req.body;
    if (
      outletName !== undefined &&
      (!outletName.trim() || !/[a-z0-9]/i.test(outletName))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Nama tenant tidak valid" });
    }
    const changes = {};
    if (outletName !== undefined) changes.outletName = outletName.trim();
    if (address !== undefined) changes.address = address?.trim() || null;
    if (status !== undefined) changes.status = Boolean(status);
    await outlet.update(changes);

    return res.status(200).json({
      success: true,
      message: "Tenant berhasil diupdate",
      data: outlet,
    });
  } catch (error) {
    console.error("UPDATE OUTLET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengupdate tenant",
      error: error.message,
    });
  }
};

const deleteOutlet = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const outlet = await Outlet.findOne({
      where: outletFilter(req, req.params.id),
      transaction,
    });
    if (!outlet) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Tenant tidak ditemukan" });
    }

    await Karyawan.update(
      { outletId: null },
      { where: { outletId: outlet.id }, transaction },
    );
    await outlet.destroy({ transaction });
    await transaction.commit();
    return res
      .status(200)
      .json({ success: true, message: "Tenant berhasil dihapus" });
  } catch (error) {
    await transaction.rollback();
    console.error("DELETE OUTLET ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus tenant",
      error: error.message,
    });
  }
};

module.exports = {
  getOutlets,
  getOutletById,
  createOutlet,
  updateOutlet,
  deleteOutlet,
};
