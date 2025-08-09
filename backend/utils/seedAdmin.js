const { User } = require('../models');

module.exports = async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'Admin123!';
  const existing = await User.findOne({ where: { email: adminEmail } });
  if (!existing) {
    await User.create({ name: 'Admin', email: adminEmail, password: adminPass, role: 'admin' });
    console.log('Admin créé:', adminEmail);
  } else {
    console.log('Admin exists');
  }
};
