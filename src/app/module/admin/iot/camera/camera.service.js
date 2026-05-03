const categoryIotModel = require('../../../../models/categoryIot.model');
const iotCameraModel = require('../../../../models/iotCamera.model');

exports.getListCamera = async (keyword) => {
  const filter = {};
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ code: regex }];
  }

  const cameras = await iotCameraModel
    .find(filter)
    .select('code isOnline categoryId')
    .populate('categoryId', 'code name');

  return cameras;
};

exports.updateCamera = async (payload) => {
  const { code, categoryCode, isOnline } = payload;

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    const category = await categoryIotModel.findOne({ code: categoryCode });
    if (!category) {
      throw new Error('Loại thiết bị không tồn tại');
    }

    const lastItem = await iotCameraModel
      .findOne({ code: { $regex: /^CAM\d+$/ } })
      .sort({ code: -1 })
      .select('code');

    let newNumber = 1;

    if (lastItem) {
      const currentNumber = parseInt(lastItem.code.replace('CAM', ''), 10);
      newNumber = currentNumber + 1;
    }

    const newCode = `CAM${String(newNumber).padStart(3, '0')}`;

    const cameraCreate = await iotCameraModel.create({
      code: newCode,
      isOnline: false,
      categoryId: category._id,
    });

    return { isCreate: true, data: cameraCreate };
  }

  // ======================
  // UPDATE
  // ======================
  const cameras = await iotCameraModel.findOne({ code });
  if (!cameras) throw new Error('Camera không tồn tại');
  if (categoryCode !== undefined) {
    const category = await categoryIotModel.findOne({ code: categoryCode });
    if (!category) throw new Error('Loại camera không tồn tại');
    cameras.categoryId = category._id;
  }
  if (isOnline === null || isOnline === undefined) {
    throw new Error('Trạng thái online không hợp lệ');
  } else {
    cameras.isOnline = isOnline;
  }

  await cameras.save();

  return { isCreate: false, data: cameras };
};

exports.deleteCamera = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách camera không hợp lệ');
  }

  const codes = items
    .map((item) => (typeof item === 'string' ? item : item.code))
    .filter((code) => typeof code === 'string' && code.trim() !== '');

  if (codes.length === 0) {
    throw new Error('Không tìm thấy mã camera hợp lệ');
  }

  const cameras = await iotCameraModel.find({
    code: { $in: codes },
  });

  if (cameras.length === 0) {
    throw new Error('Camera không tồn tại');
  }

  // =========================
  // CHECK thiếu code
  // =========================
  if (cameras.length !== codes.length) {
    const foundCodes = cameras.map((c) => c.code);
    const missingCodes = codes.filter((c) => !foundCodes.includes(c));

    throw new Error(`Camera không tồn tại: ${missingCodes.join(', ')}`);
  }

  // =========================
  // DELETE
  // =========================
  const cameraIds = cameras.map((c) => c._id);

  const result = await iotCameraModel.deleteMany({
    _id: { $in: cameraIds },
  });

  return {
    deletedCount: result.deletedCount,
  };
};
