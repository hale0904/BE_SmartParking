const express = require('express');
const authRoutes = require('../c-module/c-admin/auth/auth.route');

const router = express.Router();

router.use('/', authRoutes);

module.exports = router;
