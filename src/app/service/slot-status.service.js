const slotModel = require('../models/slot.model');
const { emitSlotUpdate } = require('../socket/socket');
const {
  getRecentSlotUpdate,
  markSlotUpdateEmitted,
} = require('../realtime/slotRealtime');

const STATUS_SLOT = {
  0: 'Vi tri trong',
  1: 'Vi tri co xe',
  2: 'Vi tri dat truoc',
  3: 'Vi tri loi/Vi tri dang chinh sua',
};

const normalizeSlotId = (slot) => slot?._id?.toString?.() || slot?.toString?.();

const buildPayload = (slot, status, meta = {}) => ({
  slotId: slot._id,
  slotCode: slot.code,
  slotStatus: status,
  source: meta.source || 'slot-service',
  sensorId: meta.sensorId || null,
  sensorCode: meta.sensorCode || null,
});

const emitSlotStatusUpdate = (slot, status, meta = {}) => {
  if (!slot?._id) return false;

  const payload = buildPayload(slot, status, meta);
  markSlotUpdateEmitted(payload);
  return emitSlotUpdate(payload);
};

const updateSlotStatus = async (slotOrId, nextStatus, meta = {}) => {
  const slot =
    typeof slotOrId === 'object' && slotOrId !== null
      ? slotOrId
      : await slotModel.findById(slotOrId);

  if (!slot) return null;

  if (slot.status === nextStatus) {
    if (meta.emitIfUnchanged) {
      emitSlotStatusUpdate(slot, nextStatus, meta);
    }
    return slot;
  }

  slot.status = nextStatus;
  slot.statusName = STATUS_SLOT[nextStatus] || slot.statusName;
  await slot.save();

  emitSlotStatusUpdate(slot, nextStatus, meta);
  return slot;
};

const emitSlotStatusFromDocument = (slot, meta = {}) => {
  if (!slot) return false;

  const recent = getRecentSlotUpdate(normalizeSlotId(slot), slot.status);
  if (recent) {
    return false;
  }

  return emitSlotStatusUpdate(slot, slot.status, meta);
};

module.exports = {
  STATUS_SLOT,
  emitSlotStatusFromDocument,
  emitSlotStatusUpdate,
  updateSlotStatus,
};
