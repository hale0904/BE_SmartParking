const Sensor = require('../../../models/sensor.model');

const updateSensorStatus = async (code, isActive) => {
  try {
    console.log('[c-iot] updateSensorStatus', { code, isActive });

    const updated = await Sensor.findOneAndUpdate(
      { code },
      { $set: { isActive } },
      { new: true }
    );

    if (!updated) {
      throw new Error('Sensor not found');
    }

    return updated;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  updateSensorStatus,
};

/* File nay trở đi của Hà

const Sensor = require('../../../models/sensor.model');
const sensorService = require('../../admin/iot/sensor/sensor.service');

const updateSensorStatus = async (code, isActive) => {
  try {
    const updated = await Sensor.findOneAndUpdate(
      { code: code },
      { $set: { isActive: isActive } },
      { new: true }
    );

    if (!updated) {
      throw new Error('Sensor not found');
    }

    // FIX Ở ĐÂY
    await sensorService.handleSensorChange(updated);

    return updated;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  updateSensorStatus,
}; */
