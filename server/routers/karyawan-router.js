const express = require("express");
const { getKaryawan, createKaryawan, updateKaryawan, deleteKaryawan } = require("../controllers/karyawan-controller");
const verifyToken = require("../middlewares/verify-token");
const router = express.Router();

router.use(verifyToken);
router.get("/", getKaryawan);
router.post("/", createKaryawan);
router.put("/:id", updateKaryawan);
router.delete("/:id", deleteKaryawan);

module.exports = router;