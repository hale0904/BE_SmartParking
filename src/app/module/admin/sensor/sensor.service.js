const sensorModel = require('../../../models/sensor.model');

exports.getListSensor = async (keyword) => {
  const filter = {};

  // search theo nameVehicles + licensePlate
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ code: regex }];
  }

  const sensor = await sensorModel
    .find(filter)
    .select('code slotId isActive isOnline');

  return sensor;
};

// Create or Update vehilces
exports.updateSensor = async (payload) => {
  const { code } = payload;

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    const lastItem = await sensorModel
      .findOne({ code: { $regex: /^SS\d+$/ } })
      .sort({ code: -1 })
      .select('code');

    let newNumber = 1;

    if (lastItem) {
      const currentNumber = parseInt(lastItem.code.replace('SS', ''), 10);
      newNumber = currentNumber + 1;
    }

    const newCode = `SS${String(newNumber).padStart(3, '0')}`;

    const sensorCreate = await sensorModel.create({
      code: newCode,
      slotId: null,
      isActive: 0,
      isOnline: false,
    });

    return { isCreate: true, data: sensorCreate };
  }

  // ======================
  // UPDATE
  // ======================
  const sensors = await sensorModel.findOne({ code });
  if (!sensors) throw new Error('Thiết bị không tồn tại');

  await sensors.save();

  return { isCreate: false, data: sensors };
};
