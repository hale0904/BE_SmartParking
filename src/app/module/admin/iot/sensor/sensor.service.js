const bookingModel = require('../../../../models/booking.model');
const categoryIotModel = require('../../../../models/categoryIot.model');
const parkingSessionModel = require('../../../../models/parkingSession.model');
const sensorModel = require('../../../../models/sensor.model');
const slotModel = require('../../../../models/slot.model');
const { emitSlotUpdate } = require('../../../../socket/socket');

const STATUS_BOOKING = {
  0: 'Da huy',
  1: 'Da gan vi tri',
  2: 'Dat truoc',
  3: 'Da hoan thanh',
};

const STATUS_SLOT = {
  0: 'Vi tri trống',
  1: 'Vi tri có xe',
  2: 'Vi tri đặt trước',
  3: 'Vi tri loi/Vi tri dang chinh sua',
};

const logSlotUpdateEmission = (slot, sensor, source) => {
  console.log('[socket] emit slot:update', {
    slotId: slot?._id?.toString?.() || null,
    slotCode: slot?.code || null,
    slotStatus: slot?.status,
    sensorCode: sensor?.code || null,
    source,
  });
};

const emitSlotStatusIfChanged = async (slot, nextStatus, meta = {}) => {
  if (!slot || slot.status === nextStatus) return false;

  slot.status = nextStatus;
  slot.statusName = STATUS_SLOT[nextStatus];
  await slot.save();
  logSlotUpdateEmission(slot, meta, meta.source || 'sensor');

  emitSlotUpdate({
    slotId: slot._id,
    slotCode: slot.code,
    slotStatus: nextStatus,
    sensorId: meta.sensorId || null,
    sensorCode: meta.sensorCode || null,
    source: meta.source || 'sensor',
  });

  return true;
};

exports.getListSensor = async (keyword) => {
  const filter = {};

  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i');
    filter.$or = [{ code: regex }];
  }

  const sensor = await sensorModel
    .find(filter)
    .select('code slotId isActive isOnline categoryId')
    .populate('categoryId', 'code name')
    .populate('slotId', 'code nameSlot');

  return sensor;
};

exports.updateSensor = async (payload) => {
  const { code, categoryCode, isOnline, isActive } = payload;

  // CREATE
  if (!code || Number(code) === 0) {
    const category = await categoryIotModel.findOne({ code: categoryCode });
    if (!category) {
      throw new Error('Loại thiết bị không tồn tại');
    }

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
      categoryId: category._id,
    });

    return { isCreate: true, data: sensorCreate };
  }

  // UPDATE
  const sensors = await sensorModel.findOne({ code });
  if (!sensors) throw new Error('Thiết bị không tồn tại');
  if (categoryCode !== undefined) {
    const category = await categoryIotModel.findOne({ code: categoryCode });
    if (!category) throw new Error('Loại thiết bị không tồn tại');
    sensors.categoryId = category._id;
  }

  if (isOnline === null || isOnline === undefined) {
    throw new Error('Trạng thái online không hợp lệ');
  } else {
    sensors.isOnline = isOnline;
  }
  await sensors.save();

  return { isCreate: false, data: sensors };
};

exports.deleteSensor = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách thiết bị không hợp lệ');
  }

  const codes = items
    .map((item) => (typeof item === 'string' ? item : item.code))
    .filter((code) => typeof code === 'string' && code.trim() !== '');

  if (codes.length === 0) {
    throw new Error('Không tìm thấy mã thiết bị hợp lệ');
  }

  const sensors = await sensorModel.find({
    code: { $in: codes },
  });

  if (sensors.length === 0) {
    throw new Error('Thiết bị không tồn tại');
  }

  // =========================
  // CHECK thiếu code
  // =========================
  if (sensors.length !== codes.length) {
    const foundCodes = sensors.map((s) => s.code);
    const missingCodes = codes.filter((c) => !foundCodes.includes(c));

    throw new Error(`Thiết bị không tồn tại: ${missingCodes.join(', ')}`);
  }

  // =========================
  //  NEW: CHECK SLOT
  // =========================
  const lockedSensors = sensors.filter((s) => s.slotId !== null);

  if (lockedSensors.length > 0) {
    const lockedCodes = lockedSensors.map((s) => s.code);
    throw new Error(
      `Không thể xoá thiết bị đang gắn slot: ${lockedCodes.join(', ')}`
    );
  }

  // =========================
  // DELETE
  // =========================
  const sensorIds = sensors.map((s) => s._id);
  const result = await sensorModel.deleteMany({
    _id: { $in: sensorIds },
  });

  return {
    deletedCount: result.deletedCount,
  };
};

exports.handleSensorChange = async (sensor) => {
  console.log('[sensor] handleSensorChange', {
    sensorCode: sensor?.code,
    sensorId: sensor?._id?.toString?.() || null,
    slotId: sensor?.slotId?.toString?.() || null,
    isActive: sensor?.isActive,
  });

  if (!sensor?.slotId) return;

  const slot = await slotModel.findById(sensor.slotId);
  if (!slot) return;

  const booking = await bookingModel.findOne({
    slotId: slot._id,
    status: { $in: [1, 2] },
  });

  const meta = {
    sensorId: sensor._id,
    sensorCode: sensor.code,
  };

  // =====================================================
  // SENSOR ACTIVE -> CÓ XE
  // =====================================================
  if (Number(sensor.isActive) === 1) {
    // cập nhật slot occupied
    if (slot.status !== 1) {
      slot.status = 1;
      slot.statusName = STATUS_SLOT[1];

      await slot.save();
    }

    // =====================================================
    // KHÔNG CÓ BOOKING
    // =====================================================
    if (!booking) {
      emitSlotUpdate({
        slotId: slot._id,
        slotCode: slot.code,
        slotStatus: slot.status,
        ...meta,
        source: 'no-booking',
      });

      return;
    }

    // =====================================================
    // CHECK XE ĐÚNG BOOKING?
    // =====================================================
    const correctSession = await parkingSessionModel.findOne({
      bookingId: booking._id,
      status: 0,
    });

    // =====================================================
    // CASE 1: SLOT BỊ CHIẾM
    // =====================================================
    if (!correctSession) {
      // tìm slot xanh khác
      const newSlot = await slotModel.findOne({
        status: 0,
        _id: { $ne: slot._id },
      });

      if (newSlot) {
        // slot mới -> vàng
        newSlot.status = 2;
        newSlot.statusName = STATUS_SLOT[2];

        await newSlot.save();

        // chuyển booking sang slot mới
        booking.slotId = newSlot._id;

        await booking.save();

        console.log(
          '[BOOKING] slot reassigned',
          booking.code,
          '=>',
          newSlot.code
        );
      }

      emitSlotUpdate({
        slotId: slot._id,
        slotCode: slot.code,
        slotStatus: slot.status,
        ...meta,
        source: 'slot-stolen',
      });

      return;
    }

    // =====================================================
    // CASE 2: ĐÚNG XE BOOKING
    // =====================================================
    if (booking.status === 2) {
      booking.status = 1;
      booking.statusName = STATUS_BOOKING[1];

      await booking.save();
    }

    emitSlotUpdate({
      slotId: slot._id,
      slotCode: slot.code,
      slotStatus: slot.status,
      ...meta,
      source: 'booking-owner-arrived',
    });

    return;
  }

  // =====================================================
  // SENSOR INACTIVE -> SLOT AVAILABLE
  // =====================================================
  if (Number(sensor.isActive) === 0 && slot.status === 1) {
    slot.status = 0;
    slot.statusName = STATUS_SLOT[0];

    await slot.save();

    emitSlotUpdate({
      slotId: slot._id,
      slotCode: slot.code,
      slotStatus: slot.status,
      ...meta,
      source: 'sensor-available',
    });
  }
};

// const parkingSessionModel = require('../../../../models/parkingSession.model');

// exports.assignSlotToSession = async ({ slotId }) => {
//   if (!slotId) return null;

//   //  Check slot hợp lệ
//   const slot = await slotModel.findById(slotId);

//   if (!slot) return null;

//   // Không gán nếu slot đang đặt trước
//   if (slot.status === 2) {
//     console.log('[assignSlot] Slot đang được đặt trước, bỏ qua', {
//       slotId,
//     });
//     return null;
//   }

//   // Check slot đã được dùng bởi session chưa
//   const existedSession = await parkingSessionModel.findOne({
//     slotId,
//     status: 0,
//   });

//   if (existedSession) {
//     console.log('[assignSlot] Slot đã được gán session khác', {
//       slotId,
//     });
//     return null;
//   }

//   // assign
//   // =========================
//   // ƯU TIÊN SESSION CÓ BOOKING
//   // =========================
//   let session = await parkingSessionModel.findOneAndUpdate(
//     {
//       status: 0,
//       slotId: null,
//       bookingId: { $ne: null },
//     },
//     {
//       $set: {
//         slotId,
//         checkInTime: new Date(),
//       },
//     },
//     {
//       sort: { createdAt: 1 },
//       new: true,
//     }
//   );

//   // =========================
//   // FALLBACK: SESSION KHÔNG BOOKING
//   // =========================
//   if (!session) {
//     session = await parkingSessionModel.findOneAndUpdate(
//       {
//         status: 0,
//         slotId: null,
//         bookingId: null,
//       },
//       {
//         $set: {
//           slotId,
//           checkInTime: new Date(),
//         },
//       },
//       {
//         sort: { createdAt: 1 },
//         new: true,
//       }
//     );
//   }

//   return session;
// };

/* File này trờ đi của Hà
const bookingModel = require('../../../../models/booking.model');
const categoryIotModel = require('../../../../models/categoryIot.model');
const sensorModel = require('../../../../models/sensor.model');
const slotModel = require('../../../../models/slot.model');

const STATUS_BOOKING = {
  0: 'Đã hủy',
  1: 'Đã gán vị trí',
  2: 'Đặt trước',
  3: 'Đã hoàn thành',
};

const STATUS_SLOT = {
  0: 'Vị trí trống',
  1: 'Vị trí có xe',
  2: 'Vị trí đặt trước',
  3: 'Vị trí lỗi/ Vị trí đang chỉnh sửa',
};

exports.getListSensor = async (keyword) => {
  const filter = {};

  // search theo nameVehicles + licensePlate
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ code: regex }];
  }

  const sensor = await sensorModel
    .find(filter)
    .select('code slotId isActive isOnline categoryId')
    .populate('categoryId', 'code name')
    .populate('slotId', 'code nameSlot');

  return sensor;
};

// Create or Update vehilces
exports.updateSensor = async (payload) => {
  const { code, categoryCode, isOnline } = payload;

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    const category = await categoryIotModel.findOne({ code: categoryCode });
    if (!category) {
      throw new Error('Loại thiết bị không tồn tại');
    }

    // if (isOnline === null || isOnline === undefined) {
    //   throw new Error('Trạng thái online không hợp lệ');
    // }

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
      categoryId: category._id,
    });

    return { isCreate: true, data: sensorCreate };
  }

  // ======================
  // UPDATE
  // ======================
  const sensors = await sensorModel.findOne({ code });
  if (!sensors) throw new Error('Thiết bị không tồn tại');
  if (categoryCode !== undefined) {
    const category = await categoryIotModel.findOne({ code: categoryCode });
    if (!category) throw new Error('Loại thiết bị không tồn tại');
    sensors.categoryId = category._id;
  }
  if (isOnline === null || isOnline === undefined) {
    throw new Error('Trạng thái online không hợp lệ');
  } else {
    sensors.isOnline = isOnline;
  }

  await sensors.save();

  return { isCreate: false, data: sensors };
};

exports.deleteSensor = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách thiết bị không hợp lệ');
  }

  const codes = items
    .map((item) => (typeof item === 'string' ? item : item.code))
    .filter((code) => typeof code === 'string' && code.trim() !== '');

  if (codes.length === 0) {
    throw new Error('Không tìm thấy mã thiết bị hợp lệ');
  }

  const sensors = await sensorModel.find({
    code: { $in: codes },
  });

  if (sensors.length === 0) {
    throw new Error('Thiết bị không tồn tại');
  }

  // =========================
  // CHECK thiếu code
  // =========================
  if (sensors.length !== codes.length) {
    const foundCodes = sensors.map((s) => s.code);
    const missingCodes = codes.filter((c) => !foundCodes.includes(c));

    throw new Error(`Thiết bị không tồn tại: ${missingCodes.join(', ')}`);
  }

  // =========================
  //  NEW: CHECK SLOT
  // =========================
  const lockedSensors = sensors.filter((s) => s.slotId !== null);

  if (lockedSensors.length > 0) {
    const lockedCodes = lockedSensors.map((s) => s.code);

    throw new Error(
      `Không thể xoá thiết bị đang gắn slot: ${lockedCodes.join(', ')}`
    );
  }

  // =========================
  // DELETE
  // =========================
  const sensorIds = sensors.map((s) => s._id);

  const result = await sensorModel.deleteMany({
    _id: { $in: sensorIds },
  });

  return {
    deletedCount: result.deletedCount,
  };
};

// exports.syncSensorStateService = async () => {
//   const sensors = await sensorModel.find({});

//   for (const sensor of sensors) {
//     const slot = await slotModel.findById(sensor.slotId);
//     if (!slot) continue;

//     const booking = await bookingModel.findOne({
//       slotId: slot._id,
//       status: { $in: [1, 2] },
//     });

//     // ======================
//     // SENSOR ON
//     // ======================
//     if (sensor.isActive === 1) {
//       if (slot.status !== 1) {
//         slot.status = 1;
//         slot.statusName = STATUS_SLOT[1];
//       }

//       if (booking && booking.status === 1) {
//         booking.status = 1; // giữ nguyên
//         booking.statusName = STATUS_BOOKING[1];
//       }

//       await Promise.all([slot.save(), booking ? booking.save() : null]);

//       continue;
//     }

//     // ======================
//     // SENSOR OFF
//     // ======================
//     if (sensor.isActive === 0 && slot.status === 1) {
//       slot.status = 0;
//       slot.statusName = STATUS_SLOT[0];

//       if (booking && booking.status === 1) {
//         booking.status = 3;
//         booking.statusName = STATUS_BOOKING[3];
//         booking.completedAt = new Date();
//       }

//       await Promise.all([slot.save(), booking ? booking.save() : null]);
//     }
//   }

//   return true;
// };

exports.handleSensorChange = async (sensor) => {
  const slot = await slotModel.findById(sensor.slotId);
  if (!slot) return;

  const booking = await bookingModel.findOne({
    slotId: slot._id,
    status: { $in: [1, 2] },
  });

  const now = new Date();

  // =========================
  // CASE: CÓ BOOKING
  // =========================
  if (booking) {
    const arrivalTime = new Date(booking.expectedArrivalTime);

    // CHƯA TỚI GIỜ
    if (now < arrivalTime) {
      // luôn giữ slot là "đặt trước"
      if (slot.status !== 2) {
        slot.status = 2;
        slot.statusName = STATUS_SLOT[2];
        await slot.save();
      }

      // KHÔNG cho phép sensor làm thay đổi booking
      return;
    }

    // =========================
    // ĐÃ TỚI GIỜ
    // =========================

    // SENSOR ON (xe vào)
    if (sensor.isActive === 1) {
      if (slot.status !== 1) {
        slot.status = 1;
        slot.statusName = STATUS_SLOT[1];
      }

      // chuyển từ "đặt trước" -> "đã gán"
      if (booking.status === 2) {
        booking.status = 1;
        booking.statusName = STATUS_BOOKING[1];
      }

      await Promise.all([slot.save(), booking.save()]);
      return;
    }

    // SENSOR OFF (xe rời)
    if (sensor.isActive === 0 && slot.status === 1) {
      slot.status = 0;
      slot.statusName = STATUS_SLOT[0];

      if (booking.status === 1) {
        booking.status = 3;
        booking.statusName = STATUS_BOOKING[3];
        booking.completedAt = now;
      }

      await Promise.all([slot.save(), booking.save()]);
      return;
    }
  }

  // =========================
  // CASE: KHÔNG CÓ BOOKING
  // =========================

  if (sensor.isActive === 1) {
    if (slot.status !== 1) {
      slot.status = 1;
      slot.statusName = STATUS_SLOT[1];
      await slot.save();
    }
    return;
  }

  if (sensor.isActive === 0 && slot.status === 1) {
    slot.status = 0;
    slot.statusName = STATUS_SLOT[0];
    await slot.save();
  }
};

*/
