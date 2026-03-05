const ZoneService = require('./admin-zone.service');

// GET LIST ZONE MAP
exports.getListZoneMap = async (req, res) => {
  try {
    const { status, keyword } = req.body;

    const data = await ZoneService.getListZoneMap(status, keyword);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// GET ZONE DETAIL
exports.getZoneDetailMap = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã khu vực',
      });
    }

    const data = await ZoneService.getZoneDetailMap(code);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE / UPDATE ZONE MAP
exports.updateZoneMap = async (req, res) => {
  try {
    const payload = req.body;
    const updatedZone = await ZoneService.updateZoneMap(payload);

    return res.status(200).json({
      success: true,
      data: updatedZone,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// DELETE ZONE MAP
exports.deleteZoneMap = async (req, res) => {
  try {
    const { floorCode, items } = req.body;

    const result = await ZoneService.deleteZoneMap(floorCode, items);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
