const Parking = require('./admin-parking.model');

const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

// Get list parking map with filter and search
exports.getListParkingMap = async (status, keyword) => {
  const filter = {};

  // filter theo status (dropdown)
  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  // search theo name + location
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ name: regex }, { location: regex }];
  }

  const parkings = await Parking.find(filter)
    .select('code name location status statusName totalFloors adminId')
    .populate('adminId', 'code userName');

  return parkings;
};

// Get parking detail by code
exports.getParkingDetail = async (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Mã bãi xe không hợp lệ');
  }

  const parking = await Parking.findOne({ code })
    .select('code name location status statusName totalFloors')
    .populate('adminId', 'code userName');

  if (!parking) {
    throw new Error('Bãi xe không tồn tại');
  }

  return parking;
};

// Create or Update parking
exports.updateParkingMap = async (payload) => {
  const { code, name, location, status, totalFloors, adminId } = payload;

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    if (!name || !location) {
      throw new Error('Thiếu thông tin bãi xe');
    }

    const count = await Parking.countDocuments();
    const newCode = `PK${String(count + 1).padStart(3, '0')}`;

    const finalStatus =
      status !== undefined && status !== null ? Number(status) : 0;

    const parking = await Parking.create({
      code: newCode,
      name,
      location,
      status: finalStatus,
      statusName: STATUS_MAP[finalStatus],
      totalFloors,
      adminId, // lấy từ token
    });

    return { isCreate: true, data: parking };
  }

  // ======================
  // UPDATE
  // ======================
  const parking = await Parking.findOne({ code });
  if (!parking) throw new Error('Bãi xe không tồn tại');

  if (
    name === undefined &&
    location === undefined &&
    totalFloors === undefined &&
    status === undefined
  ) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  if (name !== undefined) parking.name = name;
  if (location !== undefined) parking.location = location;
  if (totalFloors !== undefined) parking.totalFloors = totalFloors;

  if (status !== undefined && status !== null) {
    const newStatus = Number(status);
    parking.status = newStatus;
    parking.statusName = STATUS_MAP[newStatus];
  }

  await parking.save();

  return { isCreate: false, data: parking };
};

exports.updateParkingStatus = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách cập nhật không hợp lệ');
  }

  // validate + normalize
  const updates = items.map((item) => {
    const { code, status } = item;

    if (!code || status === undefined || status === null) {
      throw new Error('Thiếu code hoặc status');
    }

    const newStatus = Number(status);
    if (!Object.keys(STATUS_MAP).includes(String(newStatus))) {
      throw new Error(`Status không hợp lệ: ${status}`);
    }

    return {
      code,
      status: newStatus,
      statusName: STATUS_MAP[newStatus],
    };
  });

  const codes = updates.map((u) => u.code);

  // check tồn tại
  const parkings = await Parking.find({ code: { $in: codes } });

  if (parkings.length !== codes.length) {
    const existedCodes = parkings.map((p) => p.code);
    const missing = codes.filter((c) => !existedCodes.includes(c));
    throw new Error(`Bãi xe không tồn tại: ${missing.join(', ')}`);
  }

  // update từng cái (vì mỗi item có status khác nhau)
  const bulkOps = updates.map((u) => ({
    updateOne: {
      filter: { code: u.code },
      update: {
        $set: {
          status: u.status,
          statusName: u.statusName,
        },
      },
    },
  }));

  const result = await Parking.bulkWrite(bulkOps);

  return {
    modifiedCount: result.modifiedCount,
  };
};

// Delete parking map
exports.deleteParkingMap = async (items = []) => {
  // validate input
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách bãi xe không hợp lệ');
  }

  // extract codes từ DTO[]
  const codes = items
    .map((item) => item.code)
    .filter((code) => typeof code === 'string' && code.trim() !== '');

  if (codes.length === 0) {
    throw new Error('Không tìm thấy mã bãi xe hợp lệ');
  }

  // lấy danh sách parking theo code
  const parkings = await Parking.find({
    code: { $in: codes },
  });

  if (parkings.length === 0) {
    throw new Error('Bãi xe không tồn tại');
  }

  // chỉ cho xoá khi status = 0
  const invalidParkings = parkings.filter((p) => p.status !== 0);

  if (invalidParkings.length > 0) {
    const invalidCodes = invalidParkings.map((p) => p.code);
    throw new Error(
      `Chỉ những bãi xe có trạng thái "Đang chỉnh sửa" mới được xóa. Mã không hợp lệ: ${invalidCodes.join(
        ', '
      )}`
    );
  }

  // xoá
  const result = await Parking.deleteMany({
    code: { $in: codes },
  });

  return {
    deletedCount: result.deletedCount,
  };
};
