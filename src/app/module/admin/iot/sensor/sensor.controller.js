const sensorService = require('./sensor.service');

exports.getListSensor = async (req, res) => {
  try {
    const { keyword } = req.body;

    const data = await sensorService.getListSensor(keyword);
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

exports.updateSensor = async (req, res) => {
  try {
    const payload = {
      ...req.body,
    };

    const result = await sensorService.updateSensor(payload);

    return res.status(200).json({
      success: true,
      message: result.isCreate
        ? 'Thêm thiết bị thành công'
        : 'Cập nhật thiết bị thành công',
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

exports.deleteSensor = async (req, res) => {
  try {
    const { items } = req.body; // DTO[]

    const result = await sensorService.deleteSensor(items);

    return res.status(200).json({
      success: true,
      message: `Xóa thành công ${result.deletedCount} sensor`,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
