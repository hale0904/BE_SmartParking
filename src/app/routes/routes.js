const express = require('express');

const authAdminRoutes = require('../module/admin/auth/admin-auth.route');
const parkingAdminRoutes = require('../module/admin/parking/parking/admin-parking.route');
const floorAdminRoutes = require('../module/admin/parking/floor/admin-floor.route');
const zoneAdminRoutes = require('../module/admin/parking/zone/admin-zone.route');
const slotAdminRoutes = require('../module/admin/parking/slot/admin-slot.route');

const authUserRoutes = require('../module/users/auth/user-auth.route');
const parkingUserRoutes = require('../module/users/parking/user-parking.route');

const router = express.Router();

// Admin
router.use('/api/ad', [
  authAdminRoutes,
  parkingAdminRoutes,
  floorAdminRoutes,
  slotAdminRoutes,
  zoneAdminRoutes,
]);

// User
router.use('/api/us', [authUserRoutes, parkingUserRoutes]);

module.exports = router;
