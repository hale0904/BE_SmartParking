const bookingModel = require('../../../models/booking.model');
const slotModel = require('../../../models/slot.model');
const userModel = require('../../../models/user.model');
const vehiclesModel = require('../../../models/vehicles.model');

const STATUS_SLOT = {
  0: 'Vị trí trống',
  1: 'Vị trí có xe',
  2: 'Vị trí đặt trước',
  3: 'Vị trí lỗi/ Vị trí đang chỉnh sửa',
};

exports.getListBooking = async (status, keyword, userId) => {
  if (userId == null || userId == '') {
    throw new Error('Thiếu mã của người dùng');
  }

  const user = await userModel.findOne({ code: userId });
  const filter = { userId: user._id };

  // filter theo status (dropdown)
  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  // search theo nameVehicles + licensePlate
  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i'); // không phân biệt hoa thường

    filter.$or = [{ licensePlate: regex }];
  }

  if (!user) {
    throw new Error('Người dùng không hợp lệ');
  }

  const booking = await bookingModel
    .find(filter)
    .select(
      'code vehiclesId slotId userId status statusName licensePlate expectedArrivalTime licensePlate'
    )
    .populate('slotId', 'code nameSlot')
    .populate('userId', 'code userName email phone')
    .populate('vehiclesId', 'code nameVehicles');

  return booking;
};

exports.bookingSlot = async (payload) => {
  const { userId, slotId, vehiclesId, expectedArrivalTime, status } = payload;

  if (!userId || !slotId || !vehiclesId || !expectedArrivalTime) {
    throw new Error('Thiếu thông tin đặt chỗ');
  }

  const user = await userModel.findOne({ code: userId });
  const vehicle = await vehiclesModel.findOne({ code: vehiclesId });
  const slot = await slotModel.findOne({ code: slotId });

  if (!user) throw new Error('User không tồn tại');
  if (!vehicle) throw new Error('Xe không tồn tại');
  if (!slot) throw new Error('Slot không tồn tại');

  if (slot.status !== 0) {
    throw new Error('Slot không trống');
  }

  const count = await bookingModel.countDocuments();
  const newCode = `BK${String(count + 1).padStart(3, '0')}`;

  const finalStatus =
    status !== undefined && status !== null ? Number(status) : 2;

  const bookingCreated = await bookingModel.create({
    code: newCode,
    userId: user._id,
    slotId: slot._id,
    vehiclesId: vehicle._id,
    expectedArrivalTime,
    status: finalStatus,
    statusName: STATUS_SLOT[finalStatus],
    licensePlate: vehicle.licensePlate,
  });

  // update slot -> booked
  await slotModel.findByIdAndUpdate(slot._id, {
    status: 2,
    statusName: STATUS_SLOT[2],
  });

  const booking = await bookingModel
    .findById(bookingCreated._id)
    .populate('userId', 'code userName email phone');

  return { data: booking };
};
