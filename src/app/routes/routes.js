const express = require('express');
const authAdminRoutes = require('../module/admin/auth/admin-auth.route');
const authUserRoutes = require('../module/users/auth/user-auth.route');
const parkingAdminRoutes = require('../module/admin/parking/admin-parking.route');

const router = express.Router();

// Admin routes
router.use('/api/ad', authAdminRoutes);
router.use('/api/ad', parkingAdminRoutes);

// User routes
router.use('/api/us', authUserRoutes);

module.exports = router;
