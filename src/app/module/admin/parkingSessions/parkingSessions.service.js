const parkingSessionModel = require('../../../models/parkingSession.model');

exports.getParkingSessions = async (payload) => {
  const {
    status,
    plateNumber,
    fromDate,
    toDate,
    page = 1,
    limit = 10,
  } = payload;

  const filter = {};

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

    if (toDate < fromDate) {
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
  // BUILD QUERY
  // =========================
  let queryBuilder = parkingSessionModel
    .find(filter)
    .populate('vehicleId', 'code nameVehicles licensePlate')
    .populate('bookingId', 'code licensePlate expectedArrivalTime')
    .populate('licensePlateId', 'plateNumber capturedAt')
    .populate('slotId', 'code nameSlot')
    .sort({ createdAt: -1 });

  // =========================
  // FILTER BIỂN SỐ
  // =========================
  if (plateNumber) {
    queryBuilder = queryBuilder.populate({
      path: 'licensePlateId',
      match: { plateNumber },
    });
  }

  // =========================
  // PAGINATION
  // =========================
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    queryBuilder.skip(skip).limit(Number(limit)),
    parkingSessionModel.countDocuments(filter),
  ]);

  // lọc lại nếu dùng match
  const filteredData = plateNumber
    ? data.filter((item) => item.licensePlateId)
    : data;

  return {
    data: filteredData,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
    },
  };
};
