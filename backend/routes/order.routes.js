const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, orderCtrl.create);
router.get('/my', verifyToken, orderCtrl.userOrders);

module.exports = router;
