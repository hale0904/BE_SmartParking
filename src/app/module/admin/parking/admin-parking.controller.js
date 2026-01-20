const parkingService = require('./admin-parking.service');

// Get list parking map with filter and search
exports.getListParkingMap = async (req, res) => {
  try {
    const { status, keyword } = req.body;

    const data = await parkingService.getListParkingMap(status, keyword);
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

// Get parking detail by code
exports.getParkingDetail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã bãi xe',
      });
    }

    const data = await parkingService.getParkingDetail(code);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Create or Update parking map
exports.updateParkingMap = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      adminCode: req.admin?.code, // lấy từ token (nếu có auth)
    };

    const result = await parkingService.updateParkingMap(payload);

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
exports.deleteParkingMap = async (req, res) => {
  try {
    const { items } = req.body; // DTO[]

    const result = await parkingService.deleteParkingMap(items);

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
