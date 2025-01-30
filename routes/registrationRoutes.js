const express = require('express');
const { registerUser, verifyOtp , sendOtp } = require('../controllers/registration');
const { sendEmailOtp, verifyEmailOtp } = require('../controllers/emailverification');
const router = express.Router();
const db = require('../db');

// Register route
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/send-otp', sendOtp);
router.post('/send-email-otp', sendEmailOtp);
router.post('/verify-email-otp', verifyEmailOtp);

// Get user by username route (optional)
router.get('/user/:username', (req, res) => {
  const { username } = req.params;
  
  const query = 'SELECT * FROM registration WHERE username = ?';
  
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(results[0]);
  });
});

router.get('/users', (req, res) => {
  const query = 'SELECT * FROM registration';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
