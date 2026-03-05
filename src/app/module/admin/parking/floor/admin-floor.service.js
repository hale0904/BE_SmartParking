const Floor = require('../../../../models/floor.model');
const Parking = require('../../../../models/parking.model');
const Zone = require('../../../../models/zone.model');

const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

// GET LIST FLOOR MAP
exports.getListFloorMap = async (status, keyword) => {
  const filter = {};

  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i');
    filter.$or = [{ nameFloor: regex }];
  }

  const floors = await Floor.find(filter)
    .select(
      'code nameFloor level status statusName parkingCode boundary createdAt'
    )
    .populate('parkingCode', 'code name location status statusName createdAt');

  const result = await Promise.all(
    floors.map(async (f) => {
      const totalZone = await Zone.countDocuments({ floorCode: f._id });
      return {
        ...f.toObject(),
        totalZone,
      };
    })
  );

  return result;
};

// GET FLOOR DETAIL
exports.getFloorDetailMap = async (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Mã tầng không hợp lệ');
  }

  const floorDetail = await Floor.findOne({ code })
    .select(
      'code nameFloor level status statusName parkingCode boundary createdAt'
    )
    .populate('parkingCode', 'code name location status statusName createdAt');

  if (!floorDetail) {
    throw new Error('Tầng không tồn tại');
  }

  const totalZone = await Zone.countDocuments({ floorCode: floorDetail._id });

  return {
    ...floorDetail.toObject(),
    totalZone,
  };
};

// CREATE / UPDATE FLOOR
exports.updateFloorMap = async (payload) => {
  const { code, nameFloor, parkingCode, level, status, createdAt, boundary } =
    payload;

  if (!parkingCode) {
    throw new Error('Mã bãi xe (parkingCode) là bắt buộc');
  }

  const parking = await Parking.findOne({ code: parkingCode });
  if (!parking) {
    throw new Error('Bãi xe không tồn tại');
  }

  // ===== CREATE =====
  if (!code || Number(code) === 0) {
    if (!nameFloor) throw new Error('Tên tầng là bắt buộc');

    const countFloor = await Floor.countDocuments({
      parkingCode: parking._id,
    });

    const newCode = `${parking.code}F${countFloor + 1}`;
    const newLevel = countFloor + 1;

    const finalStatus =
      status !== undefined && status !== null ? Number(status) : 0;

    const newFloor = await Floor.create({
      code: newCode,
      nameFloor,
      parkingCode: parking._id,
      level: newLevel,
      status: finalStatus,
      statusName: STATUS_MAP[finalStatus],
      createdAt: createdAt ?? new Date(),
      boundary: boundary ?? { points: [], closed: false },
    });

    return {
      isCreate: true,
      data: newFloor,
    };
  }

  // ===== UPDATE =====
  const existingFloor = await Floor.findOne({ code });
  if (!existingFloor) throw new Error('Tầng không tồn tại');

  if (
    nameFloor === undefined &&
    level === undefined &&
    status === undefined &&
    parkingCode === undefined &&
    createdAt === undefined &&
    boundary === undefined
  ) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  if (nameFloor !== undefined) existingFloor.nameFloor = nameFloor;
  if (level !== undefined) existingFloor.level = level;
  if (createdAt !== undefined) existingFloor.createdAt = createdAt;
  if (boundary !== undefined) existingFloor.boundary = boundary;

  if (parkingCode !== undefined) {
    existingFloor.parkingCode = parking._id;
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

// DELETE FLOOR MAP
exports.deleteFloorMap = async (parkingCode, items = []) => {
  if (!parkingCode) throw new Error('Mã bãi xe (parkingCode) là bắt buộc');
  if (!Array.isArray(items) || items.length === 0)
    throw new Error('Danh sách tầng không hợp lệ');

  const parking = await Parking.findOne({ code: parkingCode });
  if (!parking) throw new Error('Bãi xe không tồn tại');

  const codes = items
    .map((item) => item.code)
    .filter((code) => typeof code === 'string' && code.trim() !== '');

  if (codes.length === 0) throw new Error('Không tìm thấy mã tầng hợp lệ');

  const floors = await Floor.find({
    code: { $in: codes },
    parkingCode: parking._id,
  });

  if (floors.length === 0)
    throw new Error('Tầng không tồn tại trong bãi xe này');

  const invalidFloors = floors.filter((f) => f.status !== 0);
  if (invalidFloors.length > 0) {
    const invalidCodes = invalidFloors.map((f) => f.code);
    throw new Error(
      `Chỉ những tầng có trạng thái "Đang chỉnh sửa" mới được xóa. Mã không hợp lệ: ${invalidCodes.join(
        ', '
      )}`
    );
  }

  const result = await Floor.deleteMany({
    code: { $in: codes },
    parkingCode: parking._id,
  });

  return {
    deletedCount: result.deletedCount,
  };
};
