const floor = require('../../../../models/floor.model');
const Parking = require('../../../../models/parking.model');
const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

// Get list floor map with filter and search
exports.getListFloorMap = async (status, keyword) => {
  const filter = {};

  // filter theo status (dropdown)
  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  // search theo name + location
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ name: regex }];
  }

  const floors = await floor
    .find(filter)
    .select(
      'code nameFloor level status statusName totalZone parkingCode entrances exits createdAt'
    )
    .populate('parkingCode', 'code name location status statusName createAt');

  return floors;
};

// Get floor detail by code
exports.getFloorDetailMap = async (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Mã tầng không hợp lệ');
  }

  const floorDetail = await floor
    .findOne({ code })
    .select(
      'code nameFloor level status statusName totalZone parkingCode entrances exits createdAt'
    )
    .populate('parkingCode', 'code name location status statusName createAt');

  if (!floorDetail) {
    throw new Error('Tầng không tồn tại');
  }

  return floorDetail;
};

exports.updateFloorMap = async (payload) => {
  const {
    code, // code của floor (nếu có => update, nếu rỗng => create)
    nameFloor,
    parkingCode, // FE gửi: "PK001"
    level,
    totalZone,
    entrances,
    exits,
    status,
    createdAt,
  } = payload;

  // ======================
  // VALIDATE CHA
  // ======================
  if (!parkingCode) {
    throw new Error('Mã bãi xe (parkingCode) là bắt buộc');
  }

  const parking = await Parking.findOne({ code: parkingCode });
  if (!parking) {
    throw new Error('Bãi xe không tồn tại');
  }

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    if (!nameFloor) {
      throw new Error('Tên tầng là bắt buộc');
    }

    // Sinh code tầng theo cha: PK001-F1
    const countFloor = await floor.countDocuments({
      parkingCode: parking._id,
    });

    const newCode = `${parking.code}-F${countFloor + 1}`;
    const newLevel = countFloor + 1;

    const finalStatus =
      status !== undefined && status !== null ? Number(status) : 0;

    const newFloor = await floor.create({
      code: newCode,
      nameFloor,
      parkingCode: parking._id, // lấy từ cha
      level: newLevel,
      totalZone: totalZone ?? 0,
      entrances: entrances ?? 0,
      exits: exits ?? 0,
      status: finalStatus,
      statusName: STATUS_MAP[finalStatus],
      createdAt: createdAt ?? new Date(),
    });

    return {
      isCreate: true,
      data: newFloor,
    };
  }

  // ======================
  // UPDATE
  // ======================
  const existingFloor = await floor.findOne({ code });
  if (!existingFloor) throw new Error('Tầng không tồn tại');

  if (
    nameFloor === undefined &&
    level === undefined &&
    totalZone === undefined &&
    entrances === undefined &&
    exits === undefined &&
    status === undefined &&
    parkingCode === undefined &&
    createdAt === undefined
  ) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  if (nameFloor !== undefined) existingFloor.nameFloor = nameFloor;
  if (level !== undefined) existingFloor.level = level;
  if (totalZone !== undefined) existingFloor.totalZone = totalZone;
  if (entrances !== undefined) existingFloor.entrances = entrances;
  if (exits !== undefined) existingFloor.exits = exits;
  if (createdAt !== undefined) existingFloor.createdAt = createdAt;

  // nếu đổi parkingCode => map lại sang ObjectId
  if (parkingCode !== undefined) {
    existingFloor.parkingCode = parking._id; // lấy từ cha
  }

  if (status !== undefined && status !== null) {
    const newStatus = Number(status);
    existingFloor.status = newStatus;
    existingFloor.statusName = STATUS_MAP[newStatus];
  }

  await existingFloor.save();

  return {
    isCreate: false,
    data: existingFloor,
  };
};

// Delete floor map
exports.deleteFloorMap = async (parkingCode, items = []) => {
  // validate input
  if (!parkingCode) {
    throw new Error('Mã bãi xe (parkingCode) là bắt buộc');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách tầng không hợp lệ');
  }

  // tìm parking
  const parking = await Parking.findOne({ code: parkingCode });
  if (!parking) {
    throw new Error('Bãi xe không tồn tại');
  }

  // extract floor codes
  const codes = items
    .map((item) => item.code)
    .filter((code) => typeof code === 'string' && code.trim() !== '');

  if (codes.length === 0) {
    throw new Error('Không tìm thấy mã tầng hợp lệ');
  }

  // lấy floors thuộc đúng parking
  const floors = await floor.find({
    code: { $in: codes },
    parkingCode: parking._id, // 👈 ràng buộc theo bãi
  });

  if (floors.length === 0) {
    throw new Error('Tầng không tồn tại trong bãi xe này');
  }

  // chỉ cho xoá khi status = 0
  const invalidFloors = floors.filter((f) => f.status !== 0);
  if (invalidFloors.length > 0) {
    const invalidCodes = invalidFloors.map((f) => f.code);
    throw new Error(
      `Chỉ những tầng có trạng thái "Đang chỉnh sửa" mới được xóa. Mã không hợp lệ: ${invalidCodes.join(
        ', '
      )}`
    );
  }

  // xoá
  const result = await floor.deleteMany({
    code: { $in: codes },
    parkingCode: parking._id,
  });

  return {
    deletedCount: result.deletedCount,
  };
};
