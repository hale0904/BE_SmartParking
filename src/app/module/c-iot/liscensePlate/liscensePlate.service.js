// services/licensePlate.service.js
const licensePlateModel = require('../../../models/licensePlate.model');
const cameraModel = require('../../../models/iotCamera.model');
const parkingSessionService = require('../../users/parkingSessions/parkingSessions.service');

exports.scanLicensePlate = async (payload) => {
  const { code, cameraId, plateNumber, capturedAt } = payload;

  // =========================
  // VALIDATE
  // =========================
  if (!plateNumber) {
    throw new Error('Thiếu biển số');
  }

  // =========================
  // CHECK CAMERA
  // =========================
  if (cameraId) {
    const camera = await cameraModel.findById(cameraId);
    if (!camera) {
      throw new Error('Camera không tồn tại');
    }
  }

  // =========================
  // CREATE LICENSE PLATE
  // =========================
  const licensePlate = await licensePlateModel.create({
    code: code || `LP_${Date.now()}`,
    cameraId: cameraId || null,
    plateNumber,
    capturedAt: capturedAt ? new Date(capturedAt) : new Date(),
  });

  // =========================
  // HANDLE PARKING SESSION
  // =========================
  const parkingSession =
    await parkingSessionService.handleParkingSession(licensePlate);

  return {
    licensePlate,
    parkingSession,
  };
};
