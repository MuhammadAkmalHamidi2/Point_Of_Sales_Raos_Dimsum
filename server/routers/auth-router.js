const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const verifyToken = require('../middlewares/verify-token');
const verifyRole = require('../middlewares/verify-role');
const loginLimiter = require("../middlewares/login-limiter");

router.post('/login', loginLimiter, authController.login);
router.get('/me', verifyToken, authController.getMe);
router.get('/admin-only-test', verifyToken, verifyRole(['admin']), authController.adminOnlyTest);

module.exports = router;