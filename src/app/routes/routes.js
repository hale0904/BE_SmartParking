const express = require('express');

const authAdminRoutes = require('../module/admin/auth/admin-auth.route');
const parkingAdminRoutes = require('../module/admin/parking/parking/admin-parking.route');
const floorAdminRoutes = require('../module/admin/parking/floor/admin-floor.route');
const zoneAdminRoutes = require('../module/admin/parking/zone/admin-zone.route');
const slotAdminRoutes = require('../module/admin/parking/slot/admin-slot.route');
const mapAdminRoutes = require('../module/admin/parking/map/admin-map.route');
const authUserRoutes = require('../module/users/auth/user-auth.route');
const parkingUserRoutes = require('../module/users/parking/user-parking.route');
const sensorRouter = require('../module/c-iot/sensor/sensor.route');
const vehiclesRoutes = require('../module/users/vehicles/vehicles.route');
const bookingRoutes = require('../module/users/booking/booking.route');
const statisticalRoute = require('../module/admin/statistical/statistical.route');
const sensorAdminRoute = require('../module/admin/iot/sensor/sensor.route');
const paymentRoute = require('../module/users/payment/payment.route');
const walletRoute = require('../module/users/wallet/wallet.route');
const categoryIotRoute = require('../module/admin/iot/categoryIot/categoryIot.route');
const accountUserRoute = require('../module/admin/accountUser/accountUser.route');
const infoAccountRoute = require('../module/users/infoAccount/infoAccount.route');
const cameraAdminRoute = require('../module/admin/iot/camera/camera.route');
const licensePlateRoute = require('../module/c-iot/liscensePlate/liscensePlate.route');
const parkingSessionsUserRoute = require('../module/users/parkingSessions/parkingSessions.route');
const notificationRoute = require('../module/users/notification/notification.route');
const parkingSessionRoute = require('../module/admin/parkingSessions/parkingSessions.route');
const router = express.Router();

// Admin
router.use('/api/ad', [
  authAdminRoutes,
  parkingAdminRoutes,
  floorAdminRoutes,
  slotAdminRoutes,
  zoneAdminRoutes,
  mapAdminRoutes,
  statisticalRoute,
  sensorAdminRoute,
  categoryIotRoute,
  accountUserRoute,
  cameraAdminRoute,
  parkingSessionRoute,
]);

router.use('/api', [sensorRouter, licensePlateRoute]);

// User
router.use('/api/us', [
  authUserRoutes,
  parkingUserRoutes,
  vehiclesRoutes,
  bookingRoutes,
  paymentRoute,
  walletRoute,
  infoAccountRoute,
  parkingSessionsUserRoute,
  notificationRoute,
]);

module.exports = router;
