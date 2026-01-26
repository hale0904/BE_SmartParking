const floorService = require('./admin-floor.service');

// Get list floor map with filter and search
exports.getListFloorMap = async (req, res) => {
  try {
    const { status, keyword } = req.body;

    const data = await floorService.getListFloorMap(status, keyword);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get floor detail by code
exports.getFloorDetailMap = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu mã tầng',
      });
    }

    const data = await floorService.getFloorDetailMap(code);

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

// Create or Update floor map
exports.updateFloorMap = async (req, res) => {
  try {
    const payload = req.body;
    const updatedFloor = await floorService.updateFloorMap(payload);

    return res.status(200).json({
      success: true,
      data: updatedFloor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// Delete floor map
exports.deleteFloorMap = async (req, res) => {
  try {
    const { parkingCode, items } = req.body;
    const result = await floorService.deleteFloorMap(parkingCode, items);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
