const categoryIotService = require('./categoryIot.service');

exports.getListCategoryIot = async (req, res) => {
  try {
    const { keyword } = req.body;

    const data = await categoryIotService.getListCategoryIot(keyword);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCategoryIot = async (req, res) => {
  try {
    const payload = {
      ...req.body,
    };

    const result = await categoryIotService.updateCategoryIot(payload);

    return res.status(200).json({
      success: true,
      message: result.isCreate
        ? 'Thêm loại thiết bị thành công'
        : 'Cập nhật loại thiết bị thành công',
      data: result.data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteCategoryIot = async (req, res) => {
  try {
    const { items } = req.body; // DTO[]

    const result = await categoryIotService.deleteCategoryIot(items);

    return res.status(200).json({
      success: true,
      message: `Xóa thành công ${result.deletedCount} loại thiết bị`,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
