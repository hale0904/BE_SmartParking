const express = require('express');
const authRoutes = require('../c-module/c-admin/admin-auth/admin-auth.route');

const router = express.Router();

router.use('/', authRoutes);

module.exports = router;
