const SlotService = require('./admin-slot.service');

// Create or Update slot map
exports.updateSlotMap = async (req, res) => {
  try {
    const payload = req.body;
    const updatedSlot = await SlotService.updateSlotMap(payload);

    return res.status(200).json({
      success: true,
      data: updatedSlot,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
