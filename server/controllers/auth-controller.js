const { User, Role } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({
        where: { username },
        include: Role,
      });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "Username tidak ditemukan",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: false,
          message: "Password salah",
        });
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(200).json({
        status: true,
        message: "Login berhasil",
        token,
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
        include: Role,
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User tidak ditemukan",
        });
      }

      res.status(200).json({
        status: true,
        message: "Berhasil mengambil data user",
        data: user,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Terjadi kesalahan pada server",
      });
    }
  },
};
