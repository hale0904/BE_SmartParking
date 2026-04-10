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
const sensorAdminRoute = require('../module/admin/sensor/sensor.route');

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
]);

router.use('/api', [sensorRouter]);

// User
router.use('/api/us', [
  authUserRoutes,
  parkingUserRoutes,
  vehiclesRoutes,
  bookingRoutes,
]);

module.exports = router;
