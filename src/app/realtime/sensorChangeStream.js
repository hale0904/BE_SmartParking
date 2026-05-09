const sensorModel = require('../models/sensor.model');
const sensorService = require('../module/admin/iot/sensor/sensor.service');

// const {
//   assignSlotToSession,
// } = require('../module/admin/iot/sensor/sensor.service');

let sensorChangeStream = null;

const isIsActiveUpdated = (change) => {
  const updatedFields = change?.updateDescription?.updatedFields || {};
  return Object.prototype.hasOwnProperty.call(updatedFields, 'isActive');
};

const startSensorChangeStream = () => {
  if (sensorChangeStream) {
    return sensorChangeStream;
  }

  sensorChangeStream = sensorModel.watch([], {
    fullDocument: 'updateLookup',
  });

  sensorChangeStream.on('change', async (change) => {
    try {
      if (change.operationType !== 'update' || !isIsActiveUpdated(change)) {
        return;
      }

      const sensor = change.fullDocument;
      console.log('[change-stream] sensor isActive changed', {
        sensorCode: sensor?.code || null,
        sensorId: sensor?._id?.toString?.() || null,
        slotId: sensor?.slotId?.toString?.() || null,
        isActive: sensor?.isActive,
      });

      if (!sensor?.slotId) {
        return;
      }

      await sensorService.handleSensorChange(sensor);

      // if (sensor.isActive === 1) {
      //   await assignSlotToSession({ slotId: sensor.slotId });
      // }
    } catch (error) {
      console.error(
        '[change-stream] failed to process sensor update',
        error.message
      );
    }
  });

  sensorChangeStream.on('error', (error) => {
    console.error('[change-stream] sensor watcher error', error.message);
  });

  sensorChangeStream.on('close', () => {
    console.warn('[change-stream] sensor watcher closed');
    sensorChangeStream = null;
  });

  console.log('[change-stream] sensor watcher started');
  return sensorChangeStream;
};

module.exports = {
  startSensorChangeStream,
};
