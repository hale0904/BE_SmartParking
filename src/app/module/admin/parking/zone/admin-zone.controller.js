const SlotService = require('./admin-zone.service');

// Create or Update zone map
exports.updateZoneMap = async (req, res) => {
  try {
    const payload = req.body;
    const updatedZone = await SlotService.updateZoneMap(payload);

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
