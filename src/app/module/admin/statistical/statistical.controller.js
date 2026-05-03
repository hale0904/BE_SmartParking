const statisticsService = require('./statistical.service');

exports.getStatistical = async (req, res) => {
  try {
    const { expectedArrivalTime, expectedLeaveTime, zoneIds } = req.body;

    const data = await statisticsService.getStatistical(
      expectedArrivalTime,
      expectedLeaveTime,
      zoneIds
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

// Xuất file
exports.exportReport = async (req, res) => {
  try {
    const { expectedArrivalTime, expectedLeaveTime, zoneIds, format } =
      req.body;

    const result = await statisticsService.exportReport({
      expectedArrivalTime,
      expectedLeaveTime,
      zoneIds,
      format,
    });

    // =======================
    // CSV
    // =======================
    if (result.type === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=report.csv');

      return res.send(result.content);
    }

    // =======================
    // PDF
    // =======================
    if (result.type === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

      return res.send(result.content);
    }
  } catch (error) {
    // E1
    if (error.code === 'EMPTY_DATA') {
      return res.status(400).json({
        success: false,
        message:
          'Không có dữ liệu cho các bộ lọc đã chọn. Quá trình xuất bị hủy bỏ.',
      });
    }

    // E2
    return res.status(500).json({
      success: false,
      message:
        'Không có dữ liệu cho các bộ lọc đã chọn. Quá trình xuất bị hủy bỏ.',
    });
  }
};
