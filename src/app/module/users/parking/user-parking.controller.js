const parkingMapService = require('./user-parking.service');

exports.getParkingMap = async (req, res) => {
  try {
    const { parkingCode } = req.body;

    const data = await parkingMapService.getParkingMap(parkingCode);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    if (error.message === 'Parking not found') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
