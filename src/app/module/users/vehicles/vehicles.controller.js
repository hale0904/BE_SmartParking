const vehilcesService = require('./vehicles.service');

// Get list vehilces
exports.getListVehicles = async (req, res) => {
  try {
    const { status, keyword, userId } = req.body;

    const data = await vehilcesService.getListVehicles(status, keyword, userId);
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

// Get vehilces detail by code
exports.getDetailVehilces = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã phương tiện',
      });
    }

    const data = await vehilcesService.getDetailVehilces(code);

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

// Create or Update vehilces
exports.updateVehicles = async (req, res) => {
  try {
    const payload = {
      ...req.body,
    };

    const result = await vehilcesService.updateVehicles(payload);

    return res.status(200).json({
      success: true,
      message: result.isCreate
        ? 'Thêm phương tiện thành công'
        : 'Cập nhật phương tiện thành công',
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

// Delete vehilces
exports.deleteVehilces = async (req, res) => {
  try {
    const { items } = req.body; // DTO[]

    const result = await vehilcesService.deleteVehilces(items);

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
