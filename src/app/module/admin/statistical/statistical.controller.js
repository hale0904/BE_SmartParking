const parkingMapService = require('./statistical.service');

exports.getStatistical = async (req, res) => {
  try {
    const { expectedArrivalTime, expectedLeaveTime } = req.body;

    const data = await parkingMapService.getStatistical(
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
