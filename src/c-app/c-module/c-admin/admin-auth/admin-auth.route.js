const express = require('express');
const controller = require('./admin-auth.controller');

const router = express.Router();

// routes
router.post('/register', controller.registerAdmin);
router.post('/login', controller.loginAdmin);

module.exports = router;
