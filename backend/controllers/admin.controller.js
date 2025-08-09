const { Order, Product, OrderItem, User } = require('../models');

exports.stats = async (req, res, next) => {
  try {
    const totalOrders = await Order.count();
    const sales = await Order.sum('total') || 0;
    res.json({ totalOrders, sales });
  } catch (err) { next(err); }
};

exports.listOrders = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;
    const status = req.query.status;
    const where = status ? { status } : {};
    const { rows, count } = await Order.findAndCountAll({ where, limit, offset, order: [['id','DESC']], include: [{ model: OrderItem, as: 'items', include: [Product] }, User] });
    res.json({ items: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) });
  } catch (err) { next(err); }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    await OrderItem.destroy({ where: { orderId: order.id } });
    await order.destroy();
    res.json({ message: 'Commande supprimée' });
  } catch (err) { next(err); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending','shipped','delivered'].includes(status)) return res.status(400).json({ message: 'Status invalide' });
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};
