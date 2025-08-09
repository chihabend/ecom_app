module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: { type: DataTypes.FLOAT, allowNull: false },
    imageUrl: { type: DataTypes.STRING },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    images: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true, defaultValue: [] },
    isNew: { type: DataTypes.BOOLEAN, defaultValue: false },
    isPromo: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, {
    tableName: 'products'
  });

  return Product;
};
