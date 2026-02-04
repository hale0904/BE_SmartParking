const Zone = require('../../../../models/zone.model');
const Floor = require('../../../../models/floor.model');

const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

const MIN_GAP = 1; // khoảng cách tối thiểu giữa các zone (đường đi)

// ======================
// HÀM CHECK ZONE
// ======================
function isTooCloseOrOverlap(a, b, gap) {
  const bLeft = b.startPositionX - gap;
  const bRight = b.endPositionX + gap;
  const bTop = b.startPositionY - gap;
  const bBottom = b.endPositionY + gap;

  const aLeft = a.startPositionX;
  const aRight = a.endPositionX;
  const aTop = a.startPositionY;
  const aBottom = a.endPositionY;

  return aLeft < bRight && aRight > bLeft && aTop < bBottom && aBottom > bTop;
}

// ======================
// MAIN FUNCTION
// ======================
exports.updateZoneMap = async (payload) => {
  const {
    code,
    nameZone,
    floorCode,
    status,
    totalSlots,
    createdAt,
    availableSlots,
    occupiedSlots,
    reservedSlots,
    startPositionX,
    startPositionY,
    endPositionX,
    endPositionY,
  } = payload;

  // ======================
  // VALIDATE CHA
  // ======================
  if (!floorCode) throw new Error('Mã tầng (floorCode) là bắt buộc');

  const floor = await Floor.findOne({ code: floorCode });
  if (!floor) throw new Error('Tầng không tồn tại');

  // Validate tọa độ nếu có gửi
  if (
    startPositionX !== undefined &&
    startPositionY !== undefined &&
    endPositionX !== undefined &&
    endPositionY !== undefined
  ) {
    if (startPositionX >= endPositionX || startPositionY >= endPositionY) {
      throw new Error('Tọa độ zone không hợp lệ');
    }
  }

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    if (!nameZone) throw new Error('Tên zone là bắt buộc');

    const zones = await Zone.find({ floorCode: floor._id });

    const newZoneRect = {
      startPositionX,
      startPositionY,
      endPositionX,
      endPositionY,
    };

    // Check không được dính zone khác
    for (const z of zones) {
      const oldRect = {
        startPositionX: z.startPositionX,
        startPositionY: z.startPositionY,
        endPositionX: z.endPositionX,
        endPositionY: z.endPositionY,
      };

      if (isTooCloseOrOverlap(newZoneRect, oldRect, MIN_GAP)) {
        throw new Error(
          `Zone mới quá gần hoặc chồng lên zone ${z.code}. Vui lòng chừa lối đi.`
        );
      }
    }

    const countZone = await Zone.countDocuments({
      floorCode: floor._id,
    });

    const newCode = `${floor.code}-Z${countZone + 1}`;
    const finalStatus =
      status !== undefined && status !== null ? Number(status) : 0;

    const newZone = await Zone.create({
      code: newCode,
      nameZone,
      floorCode: floor._id,
      startPositionX: startPositionX ?? 0,
      startPositionY: startPositionY ?? 0,
      endPositionX: endPositionX ?? 0,
      endPositionY: endPositionY ?? 0,
      totalSlots: totalSlots ?? 0,
      status: finalStatus,
      availableSlots: availableSlots ?? 0,
      occupiedSlots: occupiedSlots ?? 0,
      reservedSlots: reservedSlots ?? 0,
      createdAt: createdAt ? new Date(createdAt) : Date.now(),
      statusName: STATUS_MAP[finalStatus],
    });

    return {
      isCreate: true,
      data: newZone,
    };
  }

  // ======================
  // UPDATE
  // ======================
  const existingZone = await Zone.findOne({ code });
  if (!existingZone) throw new Error('Zone không tồn tại');

  const zones = await Zone.find({
    floorCode: floor._id,
    code: { $ne: code },
  });

  const updatedRect = {
    startPositionX: startPositionX ?? existingZone.startPositionX,
    startPositionY: startPositionY ?? existingZone.startPositionY,
    endPositionX: endPositionX ?? existingZone.endPositionX,
    endPositionY: endPositionY ?? existingZone.endPositionY,
  };

  for (const z of zones) {
    const oldRect = {
      startPositionX: z.startPositionX,
      startPositionY: z.startPositionY,
      endPositionX: z.endPositionX,
      endPositionY: z.endPositionY,
    };

    if (isTooCloseOrOverlap(updatedRect, oldRect, MIN_GAP)) {
      throw new Error(
        `Zone cập nhật quá gần hoặc chồng lên zone ${z.code}. Vui lòng chừa lối đi.`
      );
    }
  }

  if (nameZone !== undefined) existingZone.nameZone = nameZone;
  if (startPositionX !== undefined)
    existingZone.startPositionX = startPositionX;
  if (startPositionY !== undefined)
    existingZone.startPositionY = startPositionY;
  if (endPositionX !== undefined) existingZone.endPositionX = endPositionX;
  if (endPositionY !== undefined) existingZone.endPositionY = endPositionY;
  if (totalSlots !== undefined) existingZone.totalSlots = totalSlots;
  if (
    availableSlots !== undefined &&
    occupiedSlots !== undefined &&
    reservedSlots !== undefined
  ) {
    existingZone.availableSlots = availableSlots;
    existingZone.occupiedSlots = occupiedSlots;
    existingZone.reservedSlots = reservedSlots;
  }

  if (floorCode !== undefined) {
    existingZone.floorCode = floor._id;
  }

  if (status !== undefined && status !== null) {
    const newStatus = Number(status);
    existingZone.status = newStatus;
    existingZone.statusName = STATUS_MAP[newStatus];
  }

  await existingZone.save();

  return {
    isCreate: false,
    data: existingZone,
  };
};
