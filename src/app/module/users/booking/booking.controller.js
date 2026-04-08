const bookingsService = require('./booking.service');

exports.getListBooking = async (req, res) => {
  try {
    const { status, keyword, userId } = req.body;

    const data = await bookingsService.getListBooking(status, keyword, userId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.bookingSlot = async (req, res) => {
  try {
    const payload = {
      ...req.body,
    };

    const result = await bookingsService.bookingSlot(payload);

    return res.status(200).json({
      success: true,
      message: 'Đặt chỗ thành công',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { bookingCode, userCode } = req.body;

    const result = await bookingsService.cancelBooking(bookingCode, userCode);

    return res.status(200).json({
      success: true,
      message: 'Hủy đặt chỗ thành công',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
