const Slot = require('../../../../models/slot.model');
const Zone = require('../../../../models/zone.model');

const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

exports.updateSlotMap = async (payload) => {
  const {
    code, // code của Zone (nếu có => update, nếu rỗng => create)
    nameSlot,
    zoneCode, // FE gửi: "PK001-F1"
    status,
    positionX,
    positionY,
    createdAt,
  } = payload;

  // ======================
  // VALIDATE CHA
  // ======================
  if (!zoneCode) {
    throw new Error('Mã khu (zoneCode) là bắt buộc');
  }
  console.log(zoneCode);
  const zone = await Zone.findOne({ code: zoneCode });
  console.log(zone);
  if (!zone) {
    throw new Error('Khu không tồn tại');
  }

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    if (!nameSlot) {
      throw new Error('Tên vị trí là bắt buộc');
    }

    // Sinh code khu theo cha: PK001-F1
    const countSlot = await Slot.countDocuments({
      zoneCode: zone._id,
    });

    const newCode = `${zone.code}S${countSlot + 1}`;
    const finalStatus =
      status !== undefined && status !== null ? Number(status) : 0;

    const newSlot = await Slot.create({
      code: newCode,
      nameSlot: nameSlot,
      zoneCode: zone._id, // lấy từ cha
      positionX: positionX ?? 0,
      positionY: positionY ?? 0,
      status: finalStatus,
      createdAt: createdAt ? new Date(createdAt) : Date.now(),
      statusName: STATUS_MAP[finalStatus],
    });

    return {
      isCreate: true,
      data: newSlot,
    };
  }

  // ======================
  // UPDATE
  // ======================
  const existingSlot = await Slot.findOne({ code });
  if (!existingSlot) throw new Error('Vị trí không tồn tại');

  if (
    nameSlot === undefined &&
    positionX === undefined &&
    positionY === undefined &&
    status === undefined &&
    zoneCode === undefined
  ) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  if (nameSlot !== undefined) existingSlot.nameSlot = nameSlot;
  if (positionX !== undefined) existingSlot.positionX = positionX;
  if (positionY !== undefined) existingSlot.positionY = positionY;

  // nếu đổi zoneCode => map lại sang ObjectId
  if (zoneCode !== undefined) {
    const newZone = await Zone.findOne({ code: zoneCode.split('-')[0] });
    if (!newZone) throw new Error('Khu mới không tồn tại');
    existingSlot.zoneCode = newZone._id; // lấy từ cha
  }

  if (status !== undefined && status !== null) {
    const newStatus = Number(status);
    existingSlot.status = newStatus;
    existingSlot.statusName = STATUS_MAP[newStatus];
  }

  await existingSlot.save();

  return {
    isCreate: false,
    data: existingSlot,
  };
};
