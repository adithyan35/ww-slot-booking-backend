const express = require('express');
const { registerUser } = require('../controllers/registration');
const router = express.Router();
const db = require('../db');

// Register route
router.post('/register', registerUser);

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

module.exports = router;
