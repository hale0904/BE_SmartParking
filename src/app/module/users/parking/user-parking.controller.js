const parkingMapService = require('./user-parking.service');

exports.getParkingMap = async (req, res) => {
  try {
    const { status, expectedArrivalTime, expectedLeaveTime } = req.body;

    const data = await parkingMapService.getParkingMap(
      status,
      expectedArrivalTime,
      expectedLeaveTime
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
