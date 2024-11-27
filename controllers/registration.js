// controllers/registration.js
const bcrypt = require('bcrypt');
const db = require('../db');

exports.registerUser = async (req, res) => {
  const { username, mobilenum, email, password, confirmpassword, otp_code } = req.body;
  
  if (password !== confirmpassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `INSERT INTO registration (username, mobilenum, email, password, confirmpassword, otp_code) VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [username, mobilenum, email, hashedPassword, confirmpassword, otp_code], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username, mobile number, or email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
