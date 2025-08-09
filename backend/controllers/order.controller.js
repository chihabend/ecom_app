const Joi = require('joi');
const { Order, OrderItem, Product, sequelize } = require('../models');

const orderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({ productId: Joi.number().required(), quantity: Joi.number().integer().min(1).required() })
  ).min(1).required(),
  address: Joi.string().required()
});

exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { error, value } = orderSchema.validate(req.body);
    if (error) { await t.rollback(); return res.status(400).json({ message: error.details[0].message }); }

    // calculate total and lock rows for update
    const ids = value.items.map(i => i.productId);
    const productRows = await Product.findAll({ where: { id: ids }, transaction: t, lock: t.LOCK.UPDATE });
    const productMap = {};
    productRows.forEach(p => productMap[p.id] = p);

    let total = 0;
    for (const it of value.items) {
      const p = productMap[it.productId];
      if (!p) { await t.rollback(); return res.status(400).json({ message: `Produit ${it.productId} introuvable` }); }
      if (p.stock < it.quantity) { await t.rollback(); return res.status(400).json({ message: `Stock insuffisant pour ${p.name}` }); }
      total += p.price * it.quantity;
    }

    const order = await Order.create({ userId: req.user.id, total, address: value.address }, { transaction: t });
    const itemsToCreate = value.items.map(it => ({ orderId: order.id, productId: it.productId, quantity: it.quantity, price: productMap[it.productId].price }));
    await OrderItem.bulkCreate(itemsToCreate, { transaction: t });

    // decrement stock
    for (const it of value.items) {
      const p = productMap[it.productId];
      await p.decrement('stock', { by: it.quantity, transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: 'Commande créée', orderId: order.id });
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.userOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'items', include: [Product] }]
    });
    res.json(orders);
  } catch (err) { next(err); }
};
