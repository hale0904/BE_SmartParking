const slotModel = require('../models/slot.model');
const { emitSlotStatusFromDocument } = require('../service/slot-status.service');

let slotChangeStream = null;

const isStatusUpdated = (change) => {
  const updatedFields = change?.updateDescription?.updatedFields || {};
  return Object.prototype.hasOwnProperty.call(updatedFields, 'status');
};

const startSlotChangeStream = () => {
  if (slotChangeStream) {
    return slotChangeStream;
  }

  slotChangeStream = slotModel.watch([], {
    fullDocument: 'updateLookup',
  });

  slotChangeStream.on('change', async (change) => {
    try {
      if (change.operationType !== 'update' || !isStatusUpdated(change)) {
        return;
      }

      const slot = change.fullDocument;
      console.log('[change-stream] slot status changed', {
        slotId: slot?._id?.toString?.() || null,
        slotCode: slot?.code || null,
        status: slot?.status,
      });

      emitSlotStatusFromDocument(slot, {
        source: 'slot-change-stream',
      });
    } catch (error) {
      console.error(
        '[change-stream] failed to process slot update',
        error.message
      );
    }
  });

  slotChangeStream.on('error', (error) => {
    console.error('[change-stream] slot watcher error', error.message);
  });

  slotChangeStream.on('close', () => {
    console.warn('[change-stream] slot watcher closed');
    slotChangeStream = null;
  });

  console.log('[change-stream] slot watcher started');
  return slotChangeStream;
};

module.exports = {
  startSlotChangeStream,
};
