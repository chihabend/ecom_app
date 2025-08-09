module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    total: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('pending','shipped','delivered'), defaultValue: 'pending' },
    address: { type: DataTypes.TEXT }
  }, {
    tableName: 'orders'
  });

  return Order;
};
