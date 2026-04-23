// services/parkingSession.service.js
const parkingSessionModel = require('../../../models/parkingSession.model');
const licensePlateModel = require('../../../models/licensePlate.model');
const bookingModel = require('../../../models/booking.model');
const vehicleModel = require('../../../models/vehicles.model');

const PRICE_PER_HOUR = 30000;

exports.handleParkingSession = async (licensePlate) => {
  const { plateNumber, capturedAt, _id } = licensePlate;

  if (!plateNumber) return;

  const time = capturedAt || new Date();

  // =========================
  // TÌM VEHICLE
  // =========================
  const vehicle = await vehicleModel.findOne({
    licensePlate: plateNumber,
  });

  // =========================
  // TÌM BOOKING
  // =========================
  const booking = await bookingModel.findOne({
    licensePlate: plateNumber,
    status: { $in: [1] }, // tùy hệ thống bạn (đang active)
  });

  // =========================
  // LẤY DANH SÁCH LICENSE PLATE CÙNG BIỂN
  // =========================
  const plates = await licensePlateModel.find({ plateNumber });
  const plateIds = plates.map((p) => p._id);

  // =========================
  // TÌM SESSION ĐANG MỞ
  // =========================
  const existingSession = await parkingSessionModel.findOne({
    licensePlateId: { $in: plateIds },
    status: 0,
  });

  // =========================
  // CASE 1: CHECK-OUT
  // =========================
  if (existingSession) {
    existingSession.checkOutTime = time;
    existingSession.status = 1;
    existingSession.statusName = 'COMPLETED';

    // =========================
    // TÍNH TIỀN
    // =========================
    if (existingSession.checkInTime) {
      const diffMs = time - existingSession.checkInTime;

      const minutes = diffMs / (1000 * 60); // số phút thực
      const pricePerMinute = PRICE_PER_HOUR / 60;

      existingSession.price = Math.round(minutes * pricePerMinute);
    }

    await existingSession.save();

    return existingSession;
  }

  // =========================
  // CASE 2: CHECK-IN
  // =========================
  const newSession = await parkingSessionModel.create({
    code: `PS_${Date.now()}`,
    checkInTime: time,
    status: 0,
    statusName: 'ONGOING',

    licensePlateId: _id,

    //  GÁN THÔNG TIN
    vehicleId: vehicle?._id || null,
    bookingId: booking?._id || null,
    slotId: booking?.slotId || null,
  });

  return newSession;
};
