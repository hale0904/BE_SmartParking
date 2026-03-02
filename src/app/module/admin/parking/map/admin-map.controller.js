const mapService = require('./admin-map.service');

// Get list parking map with filter and search
exports.getListMap = async (req, res) => {
  try {
    const { status, keyword } = req.body;

    const data = await mapService.getListMap(status, keyword);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Create or Update parking map
exports.updateMap = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      adminCode: req.admin?.code, // lấy từ token (nếu có auth)
    };

    const result = await mapService.updateMap(payload);

    return res.status(200).json({
      success: true,
      message: result.isCreate
        ? 'Tạo bãi xe thành công'
        : 'Cập nhật bãi xe thành công',
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

// Delete parking map
exports.deleteMap = async (req, res) => {
  try {
    const { items } = req.body; // DTO[]

    const result = await mapService.deleteMap(items);

    return res.status(200).json({
      success: true,
      message: `Xóa thành công ${result.deletedCount} bãi xe`,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
