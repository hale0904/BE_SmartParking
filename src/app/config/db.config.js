const mongoose = require('mongoose');
const { mongoUri } = require('./env.config');

module.exports = async () => {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error', err.message);
    process.exit(1);
  }
};
