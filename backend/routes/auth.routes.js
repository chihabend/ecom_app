const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);
router.get('/profile', verifyToken, authCtrl.profile);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authCtrl.logout);

module.exports = router;
