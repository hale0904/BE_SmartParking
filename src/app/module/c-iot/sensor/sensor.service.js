const Slot = require('../../../models/slot.model');

exports.updateSensor = async (payload) => {
  try {
    const { nameSlot, sensorId, sensorStatus } = payload;

    const status = sensorStatus ? 2 : 0;

    const slot = await Slot.findOneAndUpdate(
      { nameSlot: nameSlot },
      {
        $set: {
          sensorId: sensorId,
          sensorStatus: sensorStatus,
          status: status,
        },
      },
      { new: true }
    );

    if (global.io) {
      global.io.emit('slot:update', {
        slotId: slot._id,
        nameSlot: slot.nameSlot,
        sensorStatus: slot.sensorStatus,
        status: slot.status,
      });
    }

    return {
      data: slot,
    };
  } catch (error) {
    throw error;
  }
};
