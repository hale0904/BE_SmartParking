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
    .populate('categoryId', 'code name');

  return sensor;
};

// Create or Update vehilces
exports.updateSensor = async (payload) => {
  const { code, categoryCode } = payload;

  // ======================
  // CREATE
  // ======================
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

exports.syncSensorStateService = async () => {
  const sensors = await sensorModel.find({});

  for (const sensor of sensors) {
    const slot = await slotModel.findById(sensor.slotId);
    if (!slot) continue;

    const booking = await bookingModel.findOne({
      slotId: slot._id,
      status: { $in: [1, 2] },
    });

    // ======================
    // SENSOR ON
    // ======================
    if (sensor.isActive === 1) {
      if (slot.status !== 1) {
        slot.status = 1;
        slot.statusName = STATUS_SLOT[1];
      }

      if (booking && booking.status === 1) {
        booking.status = 1; // giữ nguyên
        booking.statusName = STATUS_BOOKING[1];
      }

      await Promise.all([slot.save(), booking ? booking.save() : null]);

      continue;
    }

    // ======================
    // SENSOR OFF
    // ======================
    if (sensor.isActive === 0 && slot.status === 1) {
      slot.status = 0;
      slot.statusName = STATUS_SLOT[0];

      if (booking && booking.status === 1) {
        booking.status = 3;
        booking.statusName = STATUS_BOOKING[3];
        booking.completedAt = new Date();
      }

      await Promise.all([slot.save(), booking ? booking.save() : null]);
    }
  }

  return true;
};
