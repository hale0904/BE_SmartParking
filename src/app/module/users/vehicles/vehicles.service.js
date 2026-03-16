const userModel = require('../../../models/user.model');
const vehilcesModel = require('../../../models/vehicles.model');

const STATUS_VEHILCES = {
  0: 'Ngưng hoạt độnga',
  1: 'Hoạt động',
};

// Get list parking map with filter and search
exports.getListVehicles = async (status, keyword) => {
  const filter = {};

  // filter theo status (dropdown)
  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  // search theo nameVehicles + licensePlate
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ nameVehicles: regex }, { licensePlate: regex }];
  }

  const vehilces = await vehilcesModel
    .find(filter)
    .select(
      'code nameVehicles userId status statusName licensePlate lastOnlineAt createdAt'
    )
    .populate('userId', 'code userName email phone');

  return vehilces;
};

// Get vehilces detail by code
exports.getDetailVehilces = async (code) => {
  if (!code || typeof code !== 'string') {
    throw new Error('Mã phương tiện không hợp lệ');
  }

  const vehilces = await vehilcesModel
    .findOne({ code })
    .select(
      'code nameVehicles userId status statusName licensePlate lastOnlineAt createdAt'
    )
    .populate('userId', 'code userName email phone');

  if (!vehilces) {
    throw new Error('Phương tiện không tồn tại');
  }

  return vehilces;
};

// Create or Update vehilces
exports.updateVehicles = async (payload) => {
  const { code, nameVehicles, userId, licensePlate, status } = payload;

  // ======================
  // CREATE
  // ======================
  const user = await userModel.findOne({ code: userId });
  if (!code || Number(code) === 0) {
    if (!nameVehicles || !licensePlate) {
      throw new Error('Thiếu thông tin phương tiện');
    }

    const count = await vehilcesModel.countDocuments();
    const newCode = `VE${String(count + 1).padStart(3, '0')}`;

    const finalStatus =
      status !== undefined && status !== null ? Number(status) : 0;

    const vehicleCreated = await vehilcesModel.create({
      code: newCode,
      nameVehicles,
      licensePlate,
      status: finalStatus,
      statusName: STATUS_VEHILCES[finalStatus],
      userId: user,
    });

    const vehicle = await vehilcesModel
      .findById(vehicleCreated._id)
      .select(
        'code nameVehicles userId status statusName licensePlate lastOnlineAt createdAt'
      )
      .populate('userId', 'code userName email phone');

    return { isCreate: true, data: vehicle };
  }

  // ======================
  // UPDATE
  // ======================
  const vehilces = await vehilcesModel.findOne({ code });
  if (!vehilces) throw new Error('Phương tiện không tồn tại');

  if (
    nameVehicles === undefined &&
    licensePlate === undefined &&
    status === undefined
  ) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  if (nameVehicles !== undefined) vehilces.nameVehicles = nameVehicles;
  if (licensePlate !== undefined) vehilces.licensePlate = licensePlate;

  if (status !== undefined && status !== null) {
    const newStatus = Number(status);
    vehilces.status = newStatus;
    vehilces.statusName = STATUS_VEHILCES[newStatus];
  }

  await vehilces.save();

  return { isCreate: false, data: vehilces };
};

// Delete parking map
exports.deleteVehilces = async (items = []) => {
  // validate input
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách phương tiện không hợp lệ');
  }

  // extract codes từ DTO[]
  const codes = items
    .map((item) => item.code)
    .filter((code) => typeof code === 'string' && code.trim() !== '');

  if (codes.length === 0) {
    throw new Error('Không tìm thấy mã phương tiện hợp lệ');
  }

  // lấy danh sách vehilces theo code
  const vehilces = await vehilcesModel.find({
    code: { $in: codes },
  });

  if (vehilces.length === 0) {
    throw new Error('Phương tiện không tồn tại');
  }

  // chỉ cho xoá khi status = 0
  const invalidVehilces = vehilces.filter((p) => p.status !== 0);

  if (invalidVehilces.length > 0) {
    const invalidCodes = invalidVehilces.map((p) => p.code);
    throw new Error(
      `Chỉ những phương tiện có trạng thái "Ngưng hoạt động" mới được xóa. Mã không hợp lệ: ${invalidCodes.join(
        ', '
      )}`
    );
  }

  // xoá
  const result = await vehilcesModel.deleteMany({
    code: { $in: codes },
  });

  return {
    deletedCount: result.deletedCount,
  };
};
