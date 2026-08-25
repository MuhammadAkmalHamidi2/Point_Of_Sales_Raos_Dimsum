const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Membuat direktori public/absen jika belum ada
const uploadDir = path.join(__dirname, "../public/absen");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    const userId = req.user ? req.user.id : "user";
    cb(null, `absen-${userId}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("File yang diunggah harus berupa gambar"), false);
  }
};

const uploadAbsen = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
});

module.exports = uploadAbsen;