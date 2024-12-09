const bcrypt = require('bcrypt');
const db = require('../db');
const session = require('express-session');

exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be username or mobile number

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username or mobile number and password are required' });
  }

  const query = 'SELECT * FROM registration WHERE username = ? OR mobilenum = ?';
  db.query(query, [identifier, identifier], async (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid username, mobile number, or password' });
    }

    const user = results[0];
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ error: 'Invalid username, mobile number, or password' });
      }

      // Save user details in the session
      req.session.user = { id: user.id, username: user.username };
      res.status(200).json({ message: 'Login successful', user: req.session.user });
    } catch (error) {
      console.error('Error comparing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

// Logout functionality
exports.logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.status(200).json({ message: 'User logged out successfully' });
  });
};
