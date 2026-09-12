const express = require("express");

const router = express.Router();

const verifyToken = require("../middlewares/verify-token");

const {
  createBiayaOperasional,
  getBiayaOperasionalHariIni,
  deleteBiayaOperasional,
} = require("../controllers/biaya-operasional-controller");


// Semua endpoint membutuhkan login
router.use(verifyToken);


// GET biaya operasional
router.get(
  "/",
  getBiayaOperasionalHariIni
);


// CREATE biaya operasional
router.post(
  "/",
  createBiayaOperasional
);


// DELETE biaya operasional
router.delete(
  "/:id",
  deleteBiayaOperasional
);


module.exports = router;