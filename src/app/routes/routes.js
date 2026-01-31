const express = require('express');
const authAdminRoutes = require('../module/admin/auth/admin-auth.route');
const authUserRoutes = require('../module/users/auth/user-auth.route');
const parkingAdminRoutes = require('../module/admin/parking/parking/admin-parking.route');
const floorAdminRoutes = require('../module/admin/parking/floor/admin-floor.route');
const slotAdminRoutes = require('../module/admin/parking/slot/admin-slot.route');
const parkingUserRoutes = require('../module/users/parking/user-parking.route');

const router = express.Router();

// Admin routes
router.use('/api/ad', authAdminRoutes);
router.use('/api/ad', parkingAdminRoutes);
router.use('/api/ad', floorAdminRoutes);
router.use('/api/ad', slotAdminRoutes);

// User routes
router.use('/api/us', authUserRoutes);
router.use('/api/us', parkingUserRoutes); // Include parking routes for user access

module.exports = router;
