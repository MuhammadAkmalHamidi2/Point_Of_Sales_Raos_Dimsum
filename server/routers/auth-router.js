const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const verifyToken = require('../middlewares/verify-token');
<<<<<<< HEAD

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);
=======
const verifyRole = require('../middlewares/verify-role');

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);
router.get('/admin-only-test', verifyToken, verifyRole(['admin']), authController.adminOnlyTest);
>>>>>>> v1

module.exports = router;