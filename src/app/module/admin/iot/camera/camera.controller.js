const cameraService = require('./camera.service');

exports.getListCamera = async (req, res) => {
  try {
    const { keyword } = req.body;

    const data = await cameraService.getListCamera(keyword);
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

exports.updateCamera = async (req, res) => {
  try {
    const payload = {
      ...req.body,
    };

    const result = await cameraService.updateCamera(payload);

    return res.status(200).json({
      success: true,
      message: result.isCreate
        ? 'Thêm camera thành công'
        : 'Cập nhật camera thành công',
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

exports.deleteCamera = async (req, res) => {
  try {
    const { items } = req.body; // DTO[]

    const result = await cameraService.deleteCamera(items);

    return res.status(200).json({
      success: true,
      message: `Xóa thành công ${result.deletedCount} camera`,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
