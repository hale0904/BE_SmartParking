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

    return {
      data: slot,
    };

  } catch (error) {
    throw error;
  }
};