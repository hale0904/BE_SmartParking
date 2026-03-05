const sensorService = require('./sensor.service');

// Create or Update parking map
exports.updateMap = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      adminCode: req.admin?.code, // lấy từ token (nếu có auth)
    };

    const result = await sensorService.updateSensor(payload);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sensor thành công',
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
