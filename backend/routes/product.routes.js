const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

router.get('/', productCtrl.list);
router.get('/:id', productCtrl.get);

// Admin only for create/update/delete
router.post('/', verifyToken, isAdmin, productCtrl.create);
router.put('/:id', verifyToken, isAdmin, productCtrl.update);
router.delete('/:id', verifyToken, isAdmin, productCtrl.remove);

module.exports = router;
