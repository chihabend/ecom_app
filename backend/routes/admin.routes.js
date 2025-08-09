const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/stats', verifyToken, isAdmin, adminCtrl.stats);
router.get('/orders', verifyToken, isAdmin, adminCtrl.listOrders);
router.put('/orders/:id/status', verifyToken, isAdmin, adminCtrl.updateOrderStatus);
router.delete('/orders/:id', verifyToken, isAdmin, adminCtrl.deleteOrder);

module.exports = router;
