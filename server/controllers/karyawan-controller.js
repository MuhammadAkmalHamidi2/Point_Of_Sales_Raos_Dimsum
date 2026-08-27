const { Karyawan, Outlet, User, Role, sequelize } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");

function employeeOwnerFilter(req, id) {
  const filter = { id: id };
  if (req.user.role !== "master") {
    filter[Op.or] = [
      { category: "Produksi" },
      { "$outlet.userId$": req.user.id },
    ];
  }
  return filter;
}

const getKaryawan = async (req, res) => {
  try {
    const karyawan = await Karyawan.findAll({
      where:
        req.user.role === "master"
          ? undefined
          : {
              [Op.or]: [
                { category: "Produksi" },
                { "$outlet.userId$": req.user.id },
              ],
            },
      include: [
        { model: Outlet, as: "outlet" },
        { model: User, as: "account", attributes: ["id", "username"] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Data karyawan berhasil diambil",
      data: karyawan,
    });
  } catch (error) {
    console.error("GET KARYAWAN ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data karyawan",
      error: error.message,
    });
  }
};

function generatePassword(username) {
  return `${username}123`;
}

const createKaryawan = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name, category, phone, outletId, username } = req.body;

    if (!name?.trim() || !/[a-z0-9]/i.test(name)) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Nama karyawan tidak valid" });
    }
    if (
      category === "Tenant" &&
      (!username?.trim() || !/[a-z0-9]/i.test(username))
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Username tidak valid" });
    }

    if (!phone?.trim() || !/^(\+62|0)8[0-9]{8,11}$/.test(phone.trim())) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Nomor HP tidak valid" });
    }

    if (category === "Tenant") {
      const outlet = await Outlet.findOne({
        where:
          req.user.role === "master"
            ? { id: outletId }
            : { id: outletId, userId: req.user.id },
        transaction: t,
      });
      if (!outlet) {
        await t.rollback();
        return res
          .status(403)
          .json({ success: false, message: "Tenant bukan milik owner ini" });
      }
    }

    let userId = null;
    let plainPassword = null;

    if (category === "Tenant") {
      const kasirRole = await Role.findOne({ where: { role: "kasir" } });

      const existingUser = await User.findOne({
        where: { username },
        transaction: t,
      });
      if (existingUser) {
        throw new Error("Username sudah digunakan");
      }

      plainPassword = generatePassword(username);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const newUser = await User.create(
        {
          username,
          password: hashedPassword,
          roleId: kasirRole.id,
        },
        { transaction: t },
      );
      userId = newUser.id;
    }

    const newKaryawan = await Karyawan.create(
      {
        name,
        category,
        phone,
        outletId: category === "Tenant" ? outletId : null,
        userId,
      },
      { transaction: t },
    );

    await t.commit();

    return res.status(201).json({
      success: true,
      message: "Karyawan berhasil dibuat",
      data: {
        karyawan: newKaryawan,
        account:
          category === "Tenant" ? { username, password: plainPassword } : null,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("Gagal menambahkan karyawan:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan karyawan",
      error: error.message,
    });
  }
};

const updateKaryawan = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { name, category, phone, outletId, username } = req.body;

    const karyawan = await Karyawan.findOne({
      where: employeeOwnerFilter(req, id),
      include: [{ model: Outlet, as: "outlet", attributes: ["userId"] }],
    });
    if (!karyawan) {
      return res.status(404).json({
        success: false,
        message: "Karyawan tidak ditemukan",
      });
    }

    if (!name?.trim() || !/[a-z0-9]/i.test(name)) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Nama karyawan tidak valid" });
    }
    if (
      category === "Tenant" &&
      (!username?.trim() || !/[a-z0-9]/i.test(username))
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Username tidak valid" });
    }

    if (!phone?.trim() || !/^(\+62|0)8[0-9]{8,11}$/.test(phone.trim())) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Nomor HP tidak valid" });
    }

    if (karyawan.category !== category) {
      return res.status(400).json({
        success: false,
        message: "Tidak dapat mengubah kategori karyawan",
      });
    }

    if (category === "Tenant") {
      const outlet = await Outlet.findOne({
        where:
          req.user.role === "master"
            ? { id: outletId }
            : { id: outletId, userId: req.user.id },
        transaction: t,
      });
      if (!outlet) {
        await t.rollback();
        return res
          .status(403)
          .json({ success: false, message: "Tenant bukan milik owner ini" });
      }
      const cleanUsername = username.trim().toLowerCase();
      const existingUser = await User.findOne({
        where: { username: cleanUsername },
      });

      if (existingUser && existingUser.id !== karyawan.userId) {
        return res.status(400).json({
          success: false,
          message: "Username sudah digunakan",
        });
      }

      await User.update(
        { username: cleanUsername },
        { where: { id: karyawan.userId }, transaction: t },
      );
    }

    await karyawan.update(
      {
        name,
        phone,
        outletId: category === "Tenant" ? outletId : null,
      },
      { transaction: t },
    );

    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Karyawan berhasil diupdate",
      data: karyawan,
    });
  } catch (error) {
    await t.rollback();
    console.error("Gagal update karyawan:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal update karyawan",
      error: error.message,
    });
  }
};

const deleteKaryawan = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const karyawan = await Karyawan.findOne({
      where: employeeOwnerFilter(req, id),
      include: [{ model: Outlet, as: "outlet", attributes: ["userId"] }],
      transaction: t,
    });
    if (!karyawan) {
      return res.status(404).json({
        success: false,
        message: "Karyawan tidak ditemukan",
      });
    }

    await karyawan.destroy({ transaction: t });

    const userId = karyawan.userId;
    if (karyawan.userId) {
      await User.destroy({
        where: { id: userId },
        transaction: t,
      });
    }
    await t.commit();

    return res.status(200).json({
      success: true,
      message: "Karyawan berhasil dihapus",
    });
  } catch (error) {
    await t.rollback();
    console.error("Gagal menghapus karyawan:", error);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus karyawan",
      error: error.message,
    });
  }
};

module.exports = {
  getKaryawan,
  createKaryawan,
  updateKaryawan,
  deleteKaryawan,
};
