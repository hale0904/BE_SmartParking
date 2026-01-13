// const express = require('express');
// const controller = require('./auth.controller');

// const router = express.Router();

// router.get('/register', controller.showRegister);
// router.get('/login', controller.showLogin);

// router.post('/register', controller.register); // API REGISTER

// module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
  res.json({ message: 'Login OK' });
});

module.exports = router;
