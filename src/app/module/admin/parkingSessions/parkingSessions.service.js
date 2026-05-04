const parkingSessionModel = require('../../../models/parkingSession.model');

exports.getGuestParkingSessionsWithQR = async () => {
  return await parkingSessionModel.aggregate([
    // 1. Lọc guest (userId null)
    {
      $match: {
        userId: null,
      },
    },

    // 2. Join Transaction
    {
      $lookup: {
        from: 'transactions',
        localField: '_id',
        foreignField: 'parkingSessionId',
        as: 'transaction',
      },
    },
    {
      $unwind: {
        path: '$transaction',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 3. Join QRPayment
    {
      $lookup: {
        from: 'qrpayments',
        localField: 'transaction._id',
        foreignField: 'transactionId',
        as: 'qrPayment',
      },
    },
    {
      $unwind: {
        path: '$qrPayment',
        preserveNullAndEmptyArrays: true,
      },
    },

    // 4. Sort mới nhất
    {
      $sort: { createdAt: -1 },
    },
  ]);
};
