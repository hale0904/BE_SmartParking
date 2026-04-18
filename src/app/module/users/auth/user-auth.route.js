const express = require('express');
const controller = require('./user-auth.controller');

const router = express.Router();

router.post('/register', controller.registerUser);
router.get('/verify-email', controller.verifyEmail);
router.post('/login', controller.loginUser);
router.post('/forgot-password', controller.forgotPassword);
router.get('/reset-password', controller.resetPassword);

module.exports = router;
