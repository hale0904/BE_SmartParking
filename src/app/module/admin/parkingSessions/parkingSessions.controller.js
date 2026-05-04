const parkingSessionService = require('./parkingSessions.service');

exports.getGuestParkingSessionsWithQR = async (req, res) => {
  try {
    const result = await parkingSessionService.getGuestParkingSessionsWithQR();

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
