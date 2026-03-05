const sensorService = require('./sensor.service');

exports.updateSensor = async (req, res) => {
  try {

    const payload = {
      ...req.body,
      adminCode: req.admin?.code
    };

    const result = await sensorService.updateSensor(payload);

    return res.status(200).json({
      success: true,
      message: 'Cập nhật sensor thành công',
      data: result.data
    });

  } catch (error) {

    console.error(error);

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }
};