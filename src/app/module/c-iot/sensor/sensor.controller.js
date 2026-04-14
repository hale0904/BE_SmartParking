const sensorService = require('./sensor.service');

const updateSensor = async (req, res) => {
  try {
    const { code, isActive } = req.body;

    if (!code || isActive === undefined) {
      return res.status(400).json({
        message: 'Missing code or isActive',
      });
    }

    const result = await sensorService.updateSensorStatus(code, isActive);

    res.status(200).json({
      message: 'Update success',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  updateSensor,
};
