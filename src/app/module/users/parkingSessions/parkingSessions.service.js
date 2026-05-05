const parkingSessionModel = require('../../../models/parkingSession.model');
const licensePlateModel = require('../../../models/licensePlate.model');
const userModel = require('../../../models/user.model');
const bookingModel = require('../../../models/booking.model');
const vehicleModel = require('../../../models/vehicles.model');
const walletService = require('../wallet/wallet.service');
const paymentService = require('../payment/payment.service');
const Transaction = require('../../../models/transaction.model');
const QRPayment = require('../../../models/qrPayment');

const STATUS_BOOKING = {
  0: 'Đã hủy',
  1: 'Đã gán vị trí',
  2: 'Đặt trước',
  3: 'Đã hoàn thành',
};

exports.getParkingSessions = async (payload) => {
  const { status, plateNumber, fromDate, toDate, userCode } = payload;

  const filter = {};

  // =========================
  // FILTER USER (THEO userCode)
  // =========================
  if (userCode) {
    const user = await userModel.findOne({ code: userCode });

    if (!user) {
      throw new Error('Không tìm thấy người dùng với mã đã cung cấp');
    }

    filter.userId = user._id;
  }

  // =========================
  // FILTER STATUS
  // =========================
  if (status !== undefined && status !== null) {
    filter.status = Number(status);
  }

  // =========================
  // FILTER DATE
  // =========================
  if (fromDate || toDate) {
    filter.checkInTime = {};

    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      throw new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu');
    }

    if (fromDate) {
      const start = new Date(fromDate);
      start.setHours(0, 0, 0, 0);
      filter.checkInTime.$gte = start;
    }

    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      filter.checkInTime.$lte = end;
    }
  }

  // =========================
  // FILTER BIỂN SỐ
  // =========================
  if (plateNumber) {
    const plates = await licensePlateModel.find({
      plateNumber: { $regex: plateNumber, $options: 'i' },
    });

    const plateIds = plates.map((p) => p._id);

    if (plateIds.length === 0) {
      throw new Error('Không tìm thấy biển số phù hợp');
    }

    filter.licensePlateId = { $in: plateIds };
  }

  // =========================
  // QUERY (KHÔNG PAGINATION)
  // =========================
  const parkingSession = await parkingSessionModel
    .find(filter)
    .populate('vehicleId', 'code nameVehicles licensePlate')
    .populate('bookingId', 'code licensePlate expectedArrivalTime')
    .populate('licensePlateId', 'plateNumber capturedAt')
    .populate('slotId', 'code nameSlot')
    .sort({ createdAt: -1 });

  return parkingSession;
};

const PRICE_PER_HOUR = 30000;

const PAYMENT_STATUS = {
  UNPAID: 0,
  PAID: 1,
};

const PAYMENT_STATUS_NAME = {
  0: 'UNPAID',
  1: 'PAID',
};

// XỬ LÝ CHECKIN/CHECKOUT
exports.handleParkingSession = async (licensePlate) => {
  const { plateNumber, capturedAt, _id } = licensePlate;

  if (!plateNumber) return;

  const time = capturedAt || new Date();

  // =========================
  // TÌM VEHICLE + BOOKING
  // =========================
  const vehicle = await vehicleModel.findOne({ licensePlate: plateNumber });
  const booking = await bookingModel.findOne({
    licensePlate: plateNumber,
    status: { $in: [1, 2] },
  });

  const userId = vehicle?.userId;

  // =========================
  // LICENSE PLATE
  // =========================
  const plates = await licensePlateModel.find({ plateNumber });
  const plateIds = plates.map((p) => p._id);

  // =========================
  // SESSION ĐANG MỞ
  // =========================
  const existingSession = await parkingSessionModel.findOne({
    licensePlateId: { $in: plateIds },
    status: 0,
  });

  // =========================
  // CASE 1: XE RA
  // =========================
  if (existingSession) {
    // CẬP NHẬT BOOKING NẾU CÓ
    if (existingSession.bookingId) {
      const booking = await bookingModel.findById(existingSession.bookingId);

      if (booking && booking.status === 1) {
        booking.status = 3;
        booking.statusName = STATUS_BOOKING[3];

        await booking.save();
      }
    }

    // nếu đã thanh toán rồi thì bỏ
    if (existingSession.statusPayment === 1) {
      return {
        type: 'ALREADY_PAID',
        message: 'Phiên đã thanh toán',
      };
    }

    // =========================
    // TÍNH TIỀN (chỉ tính 1 lần)
    // =========================
    if (!existingSession.price || existingSession.price === 0) {
      const diffMs = time - existingSession.checkInTime;
      const minutes = diffMs / (1000 * 60);
      const pricePerMinute = PRICE_PER_HOUR / 60;

      existingSession.price = Math.round(minutes * pricePerMinute);
      await existingSession.save();
    }

    const amount = existingSession.price;

    // =========================
    // THỬ TRỪ VÍ
    // =========================
    try {
      await walletService.payParkingSession({
        sessionId: existingSession._id,
        userId: existingSession.userId,
      });

      // THANH TOÁN THÀNH CÔNG
      existingSession.checkOutTime = time;
      existingSession.status = 1;
      existingSession.statusName = 'COMPLETED';

      existingSession.statusPayment = PAYMENT_STATUS.PAID;
      existingSession.statusPaymentName =
        PAYMENT_STATUS_NAME[PAYMENT_STATUS.PAID];

      await existingSession.save();

      return {
        type: 'SUCCESS',
        message: 'Thanh toán thành công',
        data: existingSession,
      };
    } catch (err) {
      // =========================
      // CHECK ĐÃ CÓ QR CHƯA
      // =========================
      const existingTransaction = await Transaction.findOne({
        parkingSessionId: existingSession._id,
        status: 'PENDING',
      });

      if (existingTransaction) {
        const qr = await QRPayment.findOne({
          transactionId: existingTransaction._id,
        });

        return {
          type: 'QR_REQUIRED',
          message: 'Đã có QR, vui lòng thanh toán',
          data: {
            session: existingSession,
            qr: qr?.qrUrl,
            content: qr?.content,
            amount,
          },
        };
      }

      // =========================
      // TẠO QR PARKING (ĐÚNG)
      // =========================
      const { qrPayment } = await paymentService.createParkingQR({
        userId,
        amount,
        sessionId: existingSession._id,
      });

      return {
        type: 'QR_REQUIRED',
        message: 'Không đủ tiền, vui lòng thanh toán QR',
        data: {
          session: existingSession,
          qr: qrPayment.qrUrl,
          content: qrPayment.content,
          amount,
        },
      };
    }
  }

  // =========================
  // CASE 2: XE VÀO
  // =========================

  if (booking) {
    // CASE 1: booking từ ĐẶT TRƯỚC -> ĐÃ GÁN
    if (booking.status === 2) {
      booking.status = 1;
      booking.statusName = STATUS_BOOKING[1];

      // cập nhật giờ thực tế
      booking.expectedArrivalTime = time;

      await booking.save();
    }

    // CASE 2: đã gán rồi -> chỉ update giờ
    else if (booking.status === 1) {
      booking.expectedArrivalTime = time;
      await booking.save();
    }
  }

  const newSession = await parkingSessionModel.create({
    code: `PS_${Date.now()}`,
    checkInTime: time,
    status: 0,
    statusName: 'ONGOING',

    licensePlateId: _id,

    vehicleId: vehicle?._id || null,
    bookingId: booking?._id || null,
    slotId: booking?.slotId || null,

    userId,

    statusPayment: PAYMENT_STATUS.UNPAID,
    statusPaymentName: PAYMENT_STATUS_NAME[PAYMENT_STATUS.UNPAID],
  });

  return {
    type: 'CHECKIN',
    data: newSession,
  };
};
