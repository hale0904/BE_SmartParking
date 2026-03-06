const Slot = require('../../../models/slot.model');

exports.updateSensor = async (payload) => {
  try {
    const { nameSlot, sensorId, sensorStatus } = payload;

    const slot = await Slot.findOneAndUpdate(
      { nameSlot: nameSlot },
      {
        $set: {
          sensorId: sensorId,
          sensorStatus: sensorStatus,
        },
      },
      { new: true }
    );

    if (global.io) {
      global.io.emit('slot:update', {
        slotId: slot._id,
        nameSlot: slot.nameSlot,
        sensorStatus: slot.sensorStatus,
      });
    }

    return {
      data: slot,
    };
  } catch (error) {
    throw error;
  }
};
