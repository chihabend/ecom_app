const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

// Import models
const User = require('./user.model')(sequelize, DataTypes);
const Product = require('./product.model')(sequelize, DataTypes);
const Order = require('./order.model')(sequelize, DataTypes);
const OrderItem = require('./orderItem.model')(sequelize, DataTypes);

// Associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Product,
  Order,
  OrderItem
};
