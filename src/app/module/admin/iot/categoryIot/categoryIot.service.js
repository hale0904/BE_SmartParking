const categoryIotModel = require('../../../../models/categoryIot.model');
const sensorModel = require('../../../../models/sensor.model');

exports.getListCategoryIot = async (keyword) => {
  const filter = {};

  // search theo nameVehicles + licensePlate
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ code: regex }];
  }

  const sensor = await categoryIotModel.find(filter).select('code name');

  return sensor;
};

exports.updateCategoryIot = async (payload) => {
  const { code, name } = payload;

  // ======================
  // CREATE
  // ======================
  if (!code || Number(code) === 0) {
    const lastItem = await categoryIotModel
      .findOne({ code: { $regex: /^CA\d+$/ } })
      .sort({ code: -1 })
      .select('code');

    let newNumber = 1;

    if (lastItem) {
      const currentNumber = parseInt(lastItem.code.replace('CA', ''), 10);
      newNumber = currentNumber + 1;
    }

    const newCode = `CA${String(newNumber).padStart(3, '0')}`;

    const categoryIotCreate = await categoryIotModel.create({
      code: newCode,
      name,
    });

    return { isCreate: true, data: categoryIotCreate };
  }

  // ======================
  // UPDATE
  // ======================
  const category = await categoryIotModel.findOne({ code });
  if (!category) throw new Error('Thiết bị không tồn tại');

  if (name === undefined) {
    throw new Error('Không có dữ liệu để cập nhật');
  }

  if (name !== undefined) category.name = name;

  await category.save();

  return { isCreate: false, data: category };
};

exports.deleteCategoryIot = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Danh sách danh mục không hợp lệ');
  }

  const codes = items
    .map((item) => (typeof item === 'string' ? item : item.code))
    .filter((code) => typeof code === 'string' && code.trim() !== '');

  if (codes.length === 0) {
    throw new Error('Không tìm thấy mã danh mục hợp lệ');
  }

  const categorys = await categoryIotModel.find({
    code: { $in: codes },
  });

  if (categorys.length === 0) {
    throw new Error('Danh mục không tồn tại');
  }

  if (categorys.length !== codes.length) {
    const foundCodes = categorys.map((c) => c.code);
    const missingCodes = codes.filter((c) => !foundCodes.includes(c));

    throw new Error(`Danh mục không tồn tại: ${missingCodes.join(', ')}`);
  }

  const categoryIds = categorys.map((c) => c._id);

  const usedCategoryIds = await sensorModel.distinct('categoryId', {
    categoryId: { $in: categoryIds },
  });

  if (usedCategoryIds.length > 0) {
    const mapIdToCode = new Map(
      categorys.map((c) => [c._id.toString(), c.code])
    );

    const usedCategoryCodes = usedCategoryIds.map((id) =>
      mapIdToCode.get(id.toString())
    );

    throw new Error(
      `Không thể xoá danh mục đang chứa thiết bị. Mã: ${usedCategoryCodes.join(', ')}`
    );
  }

  const result = await categoryIotModel.deleteMany({
    _id: { $in: categoryIds },
  });

  return {
    deletedCount: result.deletedCount,
  };
};
