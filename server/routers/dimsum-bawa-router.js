const express = require("express");
const {
  createDimsumBawa,
  getDimsumBawaHariIni,
  getAllDimsumBawaPerOutletId,
  updateDimsumBawa,
  deleteDimsumBawa,
} = require("../controllers/dimsum-bawa-controller");

const verifyTokenModule = require("../middlewares/verify-token");
const verifyToken =
  typeof verifyTokenModule === "function"
    ? verifyTokenModule
    : verifyTokenModule.verifyToken || verifyTokenModule.default;

const router = express.Router();

const handlers = {
  verifyToken,
  getDimsumBawaHariIni,
  getAllDimsumBawaPerOutletId,
  createDimsumBawa,
  updateDimsumBawa,
  deleteDimsumBawa,
};

// Pengecekan handler untuk memastikan tidak ada fungsi yang undefined
Object.entries(handlers).forEach(([name, handler]) => {
  if (typeof handler !== "function") {
    console.error(
      `[ERROR ROUTER] Handler '${name}' bernilai undefined atau bukan function!`,
    );
  }
});

// Route GET utama
router.get("/", verifyToken, getDimsumBawaHariIni);

// Route khusus
router.get("/today", verifyToken, getDimsumBawaHariIni);
router.get("/outlet/:outletId", verifyToken, getAllDimsumBawaPerOutletId);

// Route aksi (CRUD)
router.post("/", verifyToken, createDimsumBawa);
router.put("/:id", verifyToken, updateDimsumBawa);
router.delete("/:id", verifyToken, deleteDimsumBawa);

module.exports = router;
