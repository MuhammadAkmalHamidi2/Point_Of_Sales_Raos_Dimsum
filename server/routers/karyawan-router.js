const express = require("express");
const {
  getKaryawan,
  createKaryawan,
  updateKaryawan,
  deleteKaryawan,
} = require("../controllers/karyawan-controller");
const verifyToken = require("../middlewares/verify-token");
const verifyRole = require("../middlewares/verify-role");
const router = express.Router();

router.use(verifyToken);
router.get("/", verifyRole(["admin", "master"]), getKaryawan);
router.post("/", verifyRole(["admin", "master"]), createKaryawan);
router.put("/:id", verifyRole(["admin", "master"]), updateKaryawan);
router.delete("/:id", verifyRole(["admin", "master"]), deleteKaryawan);

module.exports = router;
