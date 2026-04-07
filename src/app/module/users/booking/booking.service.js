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

  if (!user) {
    throw new Error('Người dùng không hợp lệ');
  }

  const filter = { userId: user._id };

  if (status !== undefined && status !== null && status !== '') {
    filter.status = Number(status);
  }

  if (keyword && keyword.trim() !== '') {
    const regex = new RegExp(keyword.trim(), 'i');

    filter.$or = [{ licensePlate: regex }];
  }

  const booking = await bookingModel
    .find(filter)
    .select(
      'code vehiclesId slotId userId status statusName licensePlate expectedArrivalTime expectedLeaveTime'
    )
    .populate('slotId', 'code nameSlot')
    .populate('userId', 'code userName email phone')
    .populate('vehiclesId', 'code nameVehicles');

  return booking;
};

exports.bookingSlot = async (payload) => {
  const {
    userId,
    slotId,
    vehiclesId,
    expectedArrivalTime,
    expectedLeaveTime,
    status,
  } = payload;

  if (
    !userId ||
    !slotId ||
    !vehiclesId ||
    !expectedArrivalTime ||
    !expectedLeaveTime
  ) {
    throw new Error('Thiếu thông tin đặt chỗ');
  }

  const user = await userModel.findOne({ code: userId });
  const vehicle = await vehiclesModel.findOne({ code: vehiclesId });
  const slot = await slotModel.findOne({ code: slotId });

  if (!user) throw new Error('User không tồn tại');
  if (!vehicle) throw new Error('Xe không tồn tại');
  if (!slot) throw new Error('Slot không tồn tại');

  const BUFFER = 15 * 60 * 1000; // 15 phút

  const arrival = new Date(expectedArrivalTime);
  const leave = new Date(expectedLeaveTime);

  // nới rộng khoảng thời gian
  const arrivalWithBuffer = new Date(arrival.getTime() - BUFFER);
  const leaveWithBuffer = new Date(leave.getTime() + BUFFER);

  // validate trước
  if (leave <= arrival) {
    throw new Error('Thời gian không hợp lệ');
  }

  // check trùng giờ (OVERLAP)
  const isConflict = await bookingModel.findOne({
    slotId: slot._id,
    status: { $in: [1, 2] },
    expectedArrivalTime: { $lt: leaveWithBuffer },
    expectedLeaveTime: { $gt: arrivalWithBuffer },
  });

  if (isConflict) {
    throw new Error('Vị trí đã được đặt trong khoảng thời gian này');
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
    expectedLeaveTime,
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
