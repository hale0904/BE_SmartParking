const Slot = require('../../../../models/slot.model');
const Floor = require('../../../../models/floor.model');

const STATUS_MAP = {
  0: 'Đang chỉnh sửa',
  1: 'Hoạt động',
  2: 'Ngưng hoạt động',
};

exports.updateSlotMap = async (payload) => {
  const {
    code, // code của floor (nếu có => update, nếu rỗng => create)
    nameSlot,
    floorCode, // FE gửi: "PK001-F1"
    status,
    zone,
    positionX,
    positionY,
  } = payload;

  // ======================
  // VALIDATE CHA
  // ======================
  if (!floorCode) {
    throw new Error('Mã tầng (floorCode) là bắt buộc');
  }

  const floor = await Floor.findOne({ code: floorCode });
  if (!floor) {
    throw new Error('Tầng không tồn tại');
  }

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    if (!nameSlot) {
      throw new Error('Tên vị trí là bắt buộc');
    }

    // Sinh code tầng theo cha: PK001-F1
    const countSlot = await Slot.countDocuments({
      floorCode: floor._id,
    });

    const newCode = `${floor.code}-S${countSlot + 1}`;
    const finalStatus =
      status !== undefined && status !== null ? Number(status) : 0;

    const newSlot = await Slot.create({
      code: newCode,
      nameSlot: nameSlot,
      floorCode: floor._id, // lấy từ cha
      positionX: positionX ?? 0,
      positionY: positionY ?? 0,
      status: finalStatus,
      zone: zone ?? '',
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
    zone === undefined &&
    status === undefined &&
    floorCode === undefined
  ) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  if (nameSlot !== undefined) existingSlot.name = nameSlot;
  if (positionX !== undefined) existingSlot.positionX = positionX;
  if (positionY !== undefined) existingSlot.positionY = positionY;
  if (zone !== undefined) existingSlot.zone = zone;

  // nếu đổi floorCode => map lại sang ObjectId
  if (floorCode !== undefined) {
    existingSlot.floorCode = floor._id; // lấy từ cha
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
