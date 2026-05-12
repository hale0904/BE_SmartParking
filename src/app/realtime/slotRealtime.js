const RECENT_UPDATE_TTL_MS = 2000;
const recentSlotUpdates = new Map();

const makeKey = (slotId, slotStatus) => `${slotId}:${slotStatus}`;

const cleanupExpired = () => {
  const now = Date.now();

  for (const [key, value] of recentSlotUpdates.entries()) {
    if (now - value.timestamp > RECENT_UPDATE_TTL_MS) {
      recentSlotUpdates.delete(key);
    }
  }
};

const markSlotUpdateEmitted = (payload) => {
  const slotId = payload?.slotId?.toString?.() || payload?.slotId;
  const slotStatus = payload?.slotStatus;

  if (!slotId || slotStatus === undefined || slotStatus === null) {
    return;
  }

  cleanupExpired();
  recentSlotUpdates.set(makeKey(slotId, slotStatus), {
    source: payload?.source || 'unknown',
    timestamp: Date.now(),
  });
};

const getRecentSlotUpdate = (slotId, slotStatus) => {
  if (!slotId || slotStatus === undefined || slotStatus === null) {
    return null;
  }

  cleanupExpired();
  return recentSlotUpdates.get(makeKey(slotId, slotStatus)) || null;
};

module.exports = {
  getRecentSlotUpdate,
  markSlotUpdateEmitted,
};
