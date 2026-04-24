const parkingSessionService = require('./parkingSessions.service');

exports.getParkingSessions = async (req, res) => {
  try {
    const payload = req.body;

    const result = await parkingSessionService.getParkingSessions(payload);

    return res.status(200).json({
      message: 'Lấy danh sách phiên đỗ thành công',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
