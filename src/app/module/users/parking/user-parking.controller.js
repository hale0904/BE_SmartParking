const parkingMapService = require('./user-parking.service');

exports.getParkingMap = async (req, res) => {
  try {
    const { status } = req.body;

    const data = await parkingMapService.getParkingMap(status);

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
