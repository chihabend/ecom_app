require('dotenv').config();
const { app, sequelize, seedAdmin } = require('./app');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');
    // Sync models - in production use migrations, here we sync for simplicity
    await sequelize.sync({ alter: true });
    console.log('Models synchronized');
    await seedAdmin(); // create admin if missing
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
  }
})();
