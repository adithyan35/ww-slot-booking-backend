// routes/registrationRoutes.js
const express = require('express');
const { registerUser } = require('../controllers/registration');
const router = express.Router();

router.post('/register', registerUser);

module.exports = router;
