const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verify-token");

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
router.post("/", createOutlet);
router.put("/:id", updateOutlet);
router.delete("/:id", deleteOutlet);

module.exports = router;
