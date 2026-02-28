const Zone = require('../../../../models/zone.model');
const Floor = require('../../../../models/floor.model');
const slotGroup = require('../../../../models/groupSLot.model');

const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

// ======================
// GET LIST
// ======================
exports.getListZoneMap = async (status, keyword) => {
  const filter = {};

  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i');
    filter.$or = [{ nameZone: regex }];
  }

  const zones = await Zone.find(filter)
    .select('code nameZone color status statusName floorCode points createdAt')
    .populate('floorCode', 'code nameFloor level status statusName createdAt');

  const result = await Promise.all(
    zones.map(async (z) => {
      const totalGroupSlot = await slotGroup.countDocuments({
        zoneCode: z._id,
      });

      return {
        ...z.toObject(),
        totalGroupSlot,
      };
    })
  );

  return result;
};

// ======================
// GET DETAIL
// ======================
exports.getZoneDetailMap = async (code) => {
  if (!code) throw new Error('Mã khu vực không hợp lệ');

  const zoneDetail = await Zone.findOne({ code })
    .select('code nameZone color status statusName floorCode points createdAt')
    .populate('floorCode', 'code nameFloor level status statusName createdAt');

  if (!zoneDetail) throw new Error('Khu vực không tồn tại');

  const totalGroupSlot = await slotGroup.countDocuments({
    zoneCode: zoneDetail._id,
  });

  return {
    ...zoneDetail.toObject(),
    totalGroupSlot,
  };
};

// ======================
// CREATE / UPDATE
// ======================
exports.updateZoneMap = async (payload) => {
  const { code, nameZone, floorCode, status, createdAt, points, color } =
    payload;

  if (!floorCode) throw new Error('Mã tầng là bắt buộc');

  const floor = await Floor.findOne({ code: floorCode });
  if (!floor) throw new Error('Tầng không tồn tại');

  // ===== CREATE =====
  if (!code || Number(code) === 0) {
    if (!nameZone) throw new Error('Tên khu vực là bắt buộc');

    const countZone = await Zone.countDocuments({ floorCode: floor._id });
    const newCode = `${floor.code}Z${countZone + 1}`;

    const finalStatus =
      status !== undefined && status !== null ? Number(status) : 0;

    const newZone = await Zone.create({
      code: newCode,
      nameZone,
      floorCode: floor._id,
      status: finalStatus,
      statusName: STATUS_MAP[finalStatus],
      createdAt: createdAt ?? new Date(),
      points: points ?? [],
      color: color ?? '',
    });

    return {
      isCreate: true,
      data: newZone,
    };
  }

  // ===== UPDATE =====
  const existingZone = await Zone.findOne({ code });
  if (!existingZone) throw new Error('Khu vực không tồn tại');

  if (nameZone !== undefined) existingZone.nameZone = nameZone;
  if (createdAt !== undefined) existingZone.createdAt = createdAt;
  if (points !== undefined) existingZone.points = points;
  if (color !== undefined) existingZone.color = color;

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

// ======================
// DELETE ZONE MAP
// ======================
exports.deleteZoneMap = async (floorCode, items = []) => {
  if (!floorCode) throw new Error('Mã tầng là bắt buộc');
  if (!Array.isArray(items) || items.length === 0)
    throw new Error('Danh sách khu vực không hợp lệ');

  const floor = await Floor.findOne({ code: floorCode });
  if (!floor) throw new Error('Tầng không tồn tại');

  const codes = items
    .map((i) => i.code)
    .filter((c) => typeof c === 'string' && c.trim() !== '');

  if (codes.length === 0) throw new Error('Không tìm thấy mã zone hợp lệ');

  const zones = await Zone.find({
    code: { $in: codes },
    floorCode: floor._id,
  });

  if (zones.length === 0) throw new Error('Zone không tồn tại trong tầng này');

  const invalidZones = zones.filter((z) => z.status !== 0);
  if (invalidZones.length > 0) {
    const invalidCodes = invalidZones.map((z) => z.code);
    throw new Error(
      `Chỉ được xoá zone ở trạng thái "Đang chỉnh sửa": ${invalidCodes.join(
        ', '
      )}`
    );
  }

  const result = await Zone.deleteMany({
    code: { $in: codes },
    floorCode: floor._id,
  });

  return {
    deletedCount: result.deletedCount,
  };
};
