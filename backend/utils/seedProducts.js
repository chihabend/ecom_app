require('dotenv').config();
const { sequelize, Product } = require('../models');

async function seedProducts() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const count = await Product.count();
    if (count > 0) {
      console.log('Products already exist, skipping seeding');
      return;
    }

    const items = [
      { name: 'Casque Bluetooth Pro', description: 'Son haute fidélité, réduction de bruit active.', price: 129.99, imageUrl: 'https://images.unsplash.com/photo-1518441902110-9e9b84935f56?q=80&w=800', stock: 50 },
      { name: 'Montre Connectée Fit', description: 'Suivi santé, GPS, 7 jours d’autonomie.', price: 89.90, imageUrl: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=800', stock: 80 },
      { name: 'Sac à dos Urbain', description: 'Étanche, compartiment laptop 15".', price: 49.00, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800', stock: 120 },
      { name: 'Clavier Mécanique RGB', description: 'Switchs tactiles, rétroéclairage personnalisable.', price: 74.50, imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800', stock: 60 },
      { name: 'Gourde Inox 1L', description: 'Isotherme 24h froid / 12h chaud.', price: 24.99, imageUrl: 'https://images.unsplash.com/photo-1542736667-069246bdbc74?q=80&w=800', stock: 200 },
      { name: 'Lampe de bureau LED', description: 'Température de couleur réglable, USB-C.', price: 39.99, imageUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?q=80&w=800', stock: 90 }
    ];

    await Product.bulkCreate(items);
    console.log('Seeded products:', items.length);
  } catch (err) {
    console.error('Seeding failed', err);
  } finally {
    await sequelize.close();
  }
}

seedProducts();


