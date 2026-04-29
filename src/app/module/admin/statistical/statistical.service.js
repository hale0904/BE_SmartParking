const bookingModel = require('../../../models/booking.model');
const groupSlotModel = require('../../../models/groupSlot.model');
const slotModel = require('../../../models/slot.model');
const zoneModel = require('../../../models/zone.model');
const parkingSessionModel = require('../../../models/parkingSession.model');

const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

exports.getStatistical = async (
  expectedArrivalTime,
  expectedLeaveTime,
  zoneIds
) => {
  const arrivalInput = expectedArrivalTime
    ? new Date(expectedArrivalTime)
    : null;

  const leaveInput = expectedLeaveTime ? new Date(expectedLeaveTime) : null;

  if (!arrivalInput || !leaveInput) {
    throw new Error('Phải truyền arrivalTime và leaveTime');
  }

  const isOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && end1 > start2;
  };

  // ===== filter zone =====
  const zoneFilter = { status: 1 };

  // CHỈ filter khi có phần tử
  if (Array.isArray(zoneIds) && zoneIds.length > 0) {
    zoneFilter._id = { $in: zoneIds };
  }

  const zones = await zoneModel.find(zoneFilter).lean();

  const result = [];

  for (const zone of zones) {
    const groups = await groupSlotModel.find({ zoneCode: zone._id }).lean();
    const groupIds = groups.map((g) => g._id);

    const slots = await slotModel
      .find({
        groupSlotCode: { $in: groupIds },
        status: { $ne: 3 },
      })
      .lean();

    const slotIds = slots.map((s) => s._id);

    const bookings = await bookingModel
      .find({
        slotId: { $in: slotIds },
      })
      .lean();

    // ===== map booking =====
    const bookingMap = {};
    for (const b of bookings) {
      const key = b.slotId.toString();
      if (!bookingMap[key]) bookingMap[key] = [];
      bookingMap[key].push(b);
    }

    let totalEmpty = 0;
    let totalUsed = 0;

    for (const slot of slots) {
      const slotBookings = bookingMap[slot._id.toString()] || [];

      const hasBooking = slotBookings.some((b) =>
        isOverlap(
          b.expectedArrivalTime,
          b.expectedLeaveTime,
          arrivalInput,
          leaveInput
        )
      );

      if (hasBooking || slot.status === 1) {
        totalUsed++;
      } else {
        totalEmpty++;
      }
    }

    const total = totalEmpty + totalUsed;

    result.push({
      zoneId: zone._id,
      zoneCode: zone.code,
      totalSlots: total,
      empty: totalEmpty,
      used: totalUsed,
      percentEmpty: total ? (totalEmpty / total) * 100 : 0,
      percentUsed: total ? (totalUsed / total) * 100 : 0,
    });
  }

  return result;
};

exports.getRevenue = async ({ type, startDate, endDate }) => {
  let start, end;

  const now = new Date();

  if (type === 'day') {
    start = new Date(now.setHours(0, 0, 0, 0));
    end = new Date(now.setHours(23, 59, 59, 999));
  }

  if (type === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  }

  if (type === 'custom') {
    start = new Date(startDate);
    end = new Date(endDate);
  }

  const result = await parkingSessionModel.aggregate([
    {
      $match: {
        status: 1,
        statusPayment: 1,
        checkOutTime: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$price' },
        totalSessions: { $sum: 1 },
      },
    },
  ]);

  return result[0] || { totalRevenue: 0, totalSessions: 0 };
};

// =======================
// TURNOVER
// =======================
exports.getTurnover = async ({ startDate, endDate, zoneIds }) => {
  const match = {
    status: 1,
    checkOutTime: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  if (zoneIds?.length) {
    const zones = await zoneModel.find({ _id: { $in: zoneIds } });
    const groups = await groupSlotModel.find({
      zoneCode: { $in: zones.map((z) => z._id) },
    });
    const slots = await slotModel.find({
      groupSlotCode: { $in: groups.map((g) => g._id) },
    });

    match.slotId = { $in: slots.map((s) => s._id) };
  }

  const totalSessions = await parkingSessionModel.countDocuments(match);

  const totalSlots = await slotModel.countDocuments({
    status: { $ne: 3 },
  });

  return {
    totalSessions,
    totalSlots,
    turnover: totalSlots ? totalSessions / totalSlots : 0,
  };
};

// EXPORT REPORT
exports.exportReport = async ({
  expectedArrivalTime,
  expectedLeaveTime,
  zoneIds,
  format, // 'pdf' | 'csv'
}) => {
  // lấy data
  const data = await exports.getStatistical(
    expectedArrivalTime,
    expectedLeaveTime,
    zoneIds
  );

  // E1: no data
  if (!data || data.length === 0) {
    const error = new Error(
      'Không có dữ liệu cho các bộ lọc đã chọn. Quá trình xuất bị hủy bỏ.'
    );
    error.code = 'EMPTY_DATA';
    throw error;
  }

  // =======================
  // CSV
  // =======================
  if (format === 'csv') {
    const parser = new Parser();
    const csv = parser.parse(data);

    return {
      type: 'csv',
      content: csv,
    };
  }

  // =======================
  // PDF
  // =======================
  if (format === 'pdf') {
    const doc = new PDFDocument();

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    return new Promise((resolve, reject) => {
      try {
        doc.fontSize(18).text('Parking Report', { align: 'center' });
        doc.moveDown();

        data.forEach((item, index) => {
          doc.fontSize(12).text(
            `${index + 1}. Zone: ${item.zoneCode}
Total: ${item.totalSlots}
Empty: ${item.empty}
Used: ${item.used}
% Empty: ${item.percentEmpty.toFixed(2)}%
% Used: ${item.percentUsed.toFixed(2)}%
---------------------------------------------------------`
          );
        });

        doc.end();

        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);

          resolve({
            type: 'pdf',
            content: pdfBuffer,
          });
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  throw new Error('Format không hợp lệ');
};
