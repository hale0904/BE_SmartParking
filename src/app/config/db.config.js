const mongoose = require('mongoose');
const { mongoUri } = require('./env.config');
const { startSensorChangeStream } = require('../realtime/sensorChangeStream');
const { startSlotChangeStream } = require('../realtime/slotChangeStream');

module.exports = async () => {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    startSensorChangeStream();
    startSlotChangeStream();
  } catch (err) {
    console.error('MongoDB error', err.message);
    process.exit(1);
  }
};

/* 
const mongoose = require('mongoose');
const { mongoUri } = require('./env.config');
const { startSensorChangeStream } = require('../realtime/sensorChangeStream');

module.exports = async () => {
  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('✅MongoDB connected');
    startSensorChangeStream();
  } catch (err) {
    console.error('❌MongoDB error', err.message);
    process.exit(1);
  }
};

/* const mongoose = require('mongoose');
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
};*/
