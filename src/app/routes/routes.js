const express = require('express');
const authAdminRoutes = require('../module/admin/auth/admin-auth.route');
const authUserRoutes = require('../module/users/auth/user-auth.route');
const parkingAdminRoutes = require('../module/admin/parking/parking/admin-parking.route');
const floorAdminRoutes = require('../module/admin/parking/floor/admin-floor.route');

const router = express.Router();

// Admin routes
router.use('/api/ad', authAdminRoutes);
router.use('/api/ad', parkingAdminRoutes);
router.use('/api/ad', floorAdminRoutes);

// User routes
router.use('/api/us', authUserRoutes);

module.exports = router;
