const { Absen } = require("../models"); // Sesuaikan dengan nama model database Anda

module.exports = {
  submitAbsen: async (req, res) => {
    try {
      const userId = req.user.id;
      const { tipe, lokasi, keterangan } = req.body;

      if (!req.file) {
        return res.status(400).json({
          status: false,
          message: "Foto bukti absensi wajib diunggah",
        });
      }

      const fotoUrl = `/public/absen/${req.file.filename}`;

      const newAbsen = await Absen.create({
        userId,
        foto: fotoUrl,
        tipe: tipe || "Masuk", // 'Masuk' atau 'Pulang'
        lokasi: lokasi || null,
        keterangan: keterangan || null,
      });

      res.status(201).json({
        status: true,
        message: "Absensi berhasil disimpan",
        data: newAbsen,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: false,
        message: "Terjadi kesalahan pada server",
      });
    }
  },

  getHistoryAbsen: async (req, res) => {
    try {
      const userId = req.user.id;

      const history = await Absen.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        status: true,
        message: "Berhasil mengambil riwayat absensi",
        data: history,
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