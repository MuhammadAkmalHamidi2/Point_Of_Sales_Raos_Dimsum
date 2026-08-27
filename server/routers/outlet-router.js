const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verify-token");
const verifyRole = require("../middlewares/verify-role");

const {
  getOutlets,
  getOutletById,
  createOutlet,
  updateOutlet,
  deleteOutlet,
} = require("../controllers/outlet-controller");

router.use(verifyToken);
router.get("/", getOutlets);
router.get("/:id", getOutletById);
router.post("/", verifyRole(["admin", "master"]), createOutlet);
router.put("/:id", verifyRole(["admin", "master"]), updateOutlet);
router.delete("/:id", verifyRole(["admin", "master"]), deleteOutlet);

module.exports = router;
