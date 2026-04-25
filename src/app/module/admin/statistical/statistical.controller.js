const statisticsService = require('./statistical.service');

exports.getStatistical = async (req, res) => {
  try {
    const { expectedArrivalTime, expectedLeaveTime } = req.body;

    const data = await statisticsService.getStatistical(
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

exports.getRevenue = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;

    const data = await statisticsService.getRevenue({
      type,
      startDate,
      endDate,
    });

    return res.json({
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

// =======================
// TURNOVER
// =======================
exports.getTurnover = async (req, res) => {
  try {
    const { startDate, endDate, zoneIds } = req.body;

    const data = await statisticsService.getTurnover({
      startDate,
      endDate,
      zoneIds,
    });

    return res.json({
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
