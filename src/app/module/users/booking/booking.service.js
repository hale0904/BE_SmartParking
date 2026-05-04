const bookingModel = require('../../../models/booking.model');
const floorModel = require('../../../models/floor.model');
const groupSlotModel = require('../../../models/groupSlot.model');
const parkingModel = require('../../../models/parking.model');
const slotModel = require('../../../models/slot.model');
const userModel = require('../../../models/user.model');
const vehiclesModel = require('../../../models/vehicles.model');
const zoneModel = require('../../../models/zone.model');
const notificationService = require('../notification/notification.service');

const STATUS_BOOKING = {
  0: 'Đã hủy',
  1: 'Đã gán vị trí',
  2: 'Đặt trước',
  3: 'Đã hoàn thành',
};

const STATUS_SLOT = {
  0: 'Vị trí trống',
  1: 'Vị trí có xe',
  2: 'Vị trí đặt trước',
  3: 'Vị trí lỗi/ Vị trí đang chỉnh sửa',
};

exports.getListBooking = async (status, keyword, userId) => {
  if (!userId) {
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
      'code vehiclesId slotId userId status statusName licensePlate expectedArrivalTime'
    )
    .populate('slotId', 'code nameSlot')
    .populate('userId', 'code userName email phone')
    .populate('vehiclesId', 'code nameVehicles');

  return booking;
};

exports.bookingSlot = async (payload) => {
  const {
    userId,
    // slotId,
    vehiclesId,
    expectedArrivalTime,
    // expectedLeaveTime,
    status,
  } = payload;

  if (
    !userId ||
    // !slotId ||
    !vehiclesId ||
    !expectedArrivalTime
    // !expectedLeaveTime
  ) {
    throw new Error('Thiếu thông tin đặt chỗ');
  }

  const user = await userModel.findOne({ code: userId });
  const vehicle = await vehiclesModel.findOne({ code: vehiclesId });
  // const slot = await slotModel.findOne({ code: slotId });

  if (!user) throw new Error('User không tồn tại');
  if (!vehicle) throw new Error('Xe không tồn tại');
  // if (!slot) throw new Error('Slot không tồn tại');

  const timeNow = new Date();
  const timeNext = new Date(expectedArrivalTime);

  const minTime = new Date(timeNow.getTime() + 30 * 60 * 1000); // sau 30 phút
  const maxTime = new Date(timeNow.getTime() + 10 * 24 * 60 * 60 * 1000); // trước 10 ngày

  if (timeNext < minTime || timeNext > maxTime) {
    throw new Error('Thời gian đặt phải sau 30 phút và trước 10 ngày');
  }

  const FOUR_HOURS = 4 * 60 * 60 * 1000;

  const startTime = new Date(timeNext.getTime() - FOUR_HOURS);
  const endTime = new Date(timeNext.getTime() + FOUR_HOURS);

  const conflictBooking = await bookingModel.findOne({
    userId: user._id,
    status: 2,
    expectedArrivalTime: {
      $gte: startTime,
      $lte: endTime,
    },
  });

  if (conflictBooking) {
    throw new Error('Mỗi lần đặt phải cách nhau ít nhất 4 tiếng');
  }

  // const BUFFER = 15 * 60 * 1000; // 15 phút

  // const arrival = new Date(expectedArrivalTime);
  // const leave = new Date(expectedLeaveTime);

  // // nới rộng khoảng thời gian
  // const arrivalWithBuffer = new Date(arrival.getTime() - BUFFER);
  // const leaveWithBuffer = new Date(leave.getTime() + BUFFER);

  // validate trước
  // if (leave <= arrival) {
  //   throw new Error('Thời gian không hợp lệ');
  // }

  // check trùng giờ (OVERLAP)
  // const isConflict = await bookingModel.findOne({
  //   slotId: slot._id,
  //   status: { $in: [1, 2] },
  //   expectedArrivalTime: { $lt: leaveWithBuffer },
  //   expectedLeaveTime: { $gt: arrivalWithBuffer },
  // });

  // if (isConflict) {
  //   throw new Error('Vị trí đã được đặt trong khoảng thời gian này');
  // }

  const lastItem = await bookingModel
    .findOne({ code: { $regex: /^BK\d+$/ } })
    .sort({ code: -1 })
    .select('code');

  let newNumber = 1;

  if (lastItem) {
    const currentNumber = parseInt(lastItem.code.replace('BK', ''), 10);
    newNumber = currentNumber + 1;
  }

  const newCode = `BK${String(newNumber).padStart(3, '0')}`;

  const finalStatus =
    status !== undefined && status !== null ? Number(status) : 2;

  const bookingCreated = await bookingModel.create({
    code: newCode,
    userId: user._id,
    slotId: null,
    vehiclesId: vehicle._id,
    expectedArrivalTime,
    // expectedLeaveTime,
    status: finalStatus,
    statusName: STATUS_BOOKING[finalStatus],
    licensePlate: vehicle.licensePlate,
  });

  await notificationService.createNotification({
    userId: user._id,
    title: 'Đặt chỗ thành công',
    message: `Bạn đã đặt chỗ lúc ${new Date(expectedArrivalTime).toLocaleString()}`,
    type: 'BOOKING',
    metadata: {
      bookingId: bookingCreated._id,
      bookingCode: bookingCreated.code,
    },
  });

  // update slot -> booked
  // await slotModel.findByIdAndUpdate(slot._id, {
  //   status: 2,
  //   statusName: STATUS_SLOT[2],
  // });

  const booking = await bookingModel
    .findById(bookingCreated._id)
    .populate('userId', 'code userName email phone');

  return { data: booking };
};

exports.autoAssignSlotForUpcomingBookings = async () => {
  const now = new Date();
  const after30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

  const parking = await parkingModel.findOne({ code: 'PK001' });

  if (!parking) {
    throw new Error('Không tìm thấy bãi xe');
  }

  const floors = await floorModel
    .find({
      parkingCode: parking._id,
      status: 1,
    })
    .select('_id');

  const floorIds = floors.map((item) => item._id);

  const zones = await zoneModel
    .find({
      floorCode: { $in: floorIds },
      status: 1,
    })
    .select('_id');

  const zoneIds = zones.map((item) => item._id);

  const groups = await groupSlotModel
    .find({
      zoneCode: { $in: zoneIds },
    })
    .select('_id');

  const groupIds = groups.map((item) => item._id);

  const bookings = await bookingModel.find({
    slotId: null,
    status: 2, // Đặc trước
    expectedArrivalTime: {
      $lte: after30Minutes,
    },
  });

  for (const booking of bookings) {
    const emptySlot = await slotModel.findOneAndUpdate(
      {
        groupSlotCode: { $in: groupIds },
        status: 0,
      },
      {
        status: 2,
        statusName: STATUS_SLOT[2],
      },
      {
        new: true,
        sort: { createdAt: 1 },
      }
    );

    // nếu có slot thì assign
    if (emptySlot) {
      await bookingModel.findByIdAndUpdate(booking._id, {
        slotId: emptySlot._id,
        status: 1,
        statusName: STATUS_BOOKING[1],
      });

      await notificationService.createNotification({
        userId: booking.userId._id,
        title: 'Đã giữ chỗ',
        message: 'Slot của bạn đã được giữ, vui lòng đến đúng giờ',
        type: 'BOOKING_ASSIGNED',
        metadata: {
          bookingId: booking._id,
          slotId: emptySlot._id,
        },
      });
    }

    // nếu không còn slot và đã đến giờ hoặc quá giờ thì tự hủy
    if (new Date(booking.expectedArrivalTime) <= now) {
      await bookingModel.findByIdAndUpdate(booking._id, {
        status: 0, // hủy
        statusName: STATUS_BOOKING[0],
        cancelReason: 'Hết chỗ trống',
        cancelledAt: new Date(),
      });

      await notificationService.createNotification({
        userId: booking.userId._id,
        title: 'Booking bị hủy',
        message: 'Bãi xe đã hết chỗ',
        type: 'BOOKING_CANCEL',
        metadata: {
          bookingId: booking._id,
        },
      });
    }
  }

  return true;
};

exports.releaseUncheckinBookings = async () => {
  const now = new Date();

  const expiredBookings = await bookingModel.find({
    status: 1, // đã được gán slot
    slotId: { $ne: null },
    expectedArrivalTime: {
      $lte: new Date(now.getTime() - 15 * 60 * 1000), // quá 15p
    },
  });

  for (const booking of expiredBookings) {
    const slot = await slotModel.findById(booking.slotId);

    // chỉ xử lý nếu slot vẫn chưa có xe
    if (slot && slot.status !== 1) {
      // 1. trả slot về trống
      await slotModel.findByIdAndUpdate(slot._id, {
        status: 0,
        statusName: STATUS_SLOT[0],
        reservedAt: null,
      });

      // 2. hủy booking
      await bookingModel.findByIdAndUpdate(booking._id, {
        status: 0,
        statusName: STATUS_BOOKING[0],
        cancelReason: 'Không check-in sau 15 phút',
        cancelledAt: new Date(),
      });

      await notificationService.createNotification({
        userId: booking.userId._id,
        title: 'Booking bị hủy',
        message: 'Bạn đã không check-in sau 15 phút',
        type: 'BOOKING_TIMEOUT',
        metadata: {
          bookingId: booking._id,
        },
      });
    }
  }

  return true;
};

exports.cancelBooking = async (bookingCode, userCode) => {
  if (!bookingCode || !userCode) {
    throw new Error('Thiếu thông tin booking hoặc user');
  }

  const user = await userModel.findOne({ code: userCode });

  if (!user) {
    throw new Error('Người dùng không tồn tại');
  }

  const booking = await bookingModel.findOne({
    code: bookingCode,
    userId: user._id,
  });

  if (!booking) {
    throw new Error('Không tìm thấy booking');
  }

  // đã hủy hoặc đã hoàn thành thì không được hủy nữa
  if ([0, 3].includes(booking.status)) {
    throw new Error('Booking này không thể hủy');
  }

  // nếu đã được gán vị trí thì trả slot về trống
  if (booking.slotId) {
    await slotModel.findByIdAndUpdate(booking.slotId, {
      status: 0,
      statusName: STATUS_SLOT[0],
    });
  }

  await bookingModel.findByIdAndUpdate(booking._id, {
    status: 0,
    statusName: STATUS_BOOKING[0],
    cancelReason: 'Người dùng tự hủy',
    cancelledAt: new Date(),
    slotId: null,
  });

  await notificationService.createNotification({
    userId: booking.userId,
    title: 'Đã hủy booking',
    message: `Bạn đã hủy booking ${booking.code}`,
    type: 'BOOKING_CANCEL',
    metadata: {
      bookingId: booking._id,
    },
  });

  return;
};
