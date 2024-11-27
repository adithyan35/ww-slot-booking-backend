// controllers/login.js
const bcrypt = require('bcrypt');
const db = require('../db');

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM registration WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful' });
  });
};
