const { User, Role, Karyawan } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({
        where: { username },
        include: [
          Role,
          {
            model: Karyawan,
            as: "karyawan",
            attributes: ["outletId"],
            required: false,
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "Username atau Password salah",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: false,
          message: "Username atau Password salah",
        });
      }

      const outletId = user.karyawan?.outletId ?? null;

      const token = jwt.sign(
        { id: user.id, role: user.Role.role, outletId },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
      );

      res.status(200).json({
        status: true,
        message: "Login berhasil",
        token,
        role: user.Role.role,
        outletId,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Terjadi kesalahan pada server",
      });
    }
  },

  getMe: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          Role,
          {
            model: Karyawan,
            as: "karyawan",
            attributes: ["outletId"],
            required: false,
          },
        ],
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User tidak ditemukan",
        });
      }

      const userData = user.toJSON();
      userData.outletId = user.karyawan?.outletId ?? null;

      res.status(200).json({
        status: true,
        message: "Berhasil mengambil data user",
        data: userData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Terjadi kesalahan pada server",
      });
    }
  },

  adminOnlyTest: async (req, res) => {
    res.status(200).json({
      status: true,
      message: "Akses admin berhasil",
    });
  },
};
