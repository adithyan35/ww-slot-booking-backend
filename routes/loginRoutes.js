const express = require('express');
const { loginUser, logoutUser } = require('../controllers/login');
const { forgotPassword } = require('../controllers/forgetpassword');
const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);


module.exports = router;
