const express = require('express');
const authAdminRoutes = require('../module/admin/auth/admin-auth.route');
const authUserRoutes = require('../module/users/auth/user-auth.route');

const router = express.Router();

router.use('/api/ad', authAdminRoutes);
router.use('/api/us', authUserRoutes);

module.exports = router;
