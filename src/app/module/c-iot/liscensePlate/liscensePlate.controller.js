// controllers/licensePlate.controller.js
const licensePlateService = require('./liscensePlate.service');

exports.scanLicensePlate = async (req, res) => {
  try {
    const payload = req.body;

    const result = await licensePlateService.scanLicensePlate(payload);

    return res.status(200).json({
      message: 'Scan biển số thành công',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || 'Lỗi xử lý',
    });
  }
};
