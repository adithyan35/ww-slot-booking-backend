const bcrypt = require('bcrypt');
const db = require('../db');

exports.forgotPassword = async (req, res) => {
    const { mobilenum, newPassword } = req.body;
  
    if (!mobilenum || !newPassword) {
      return res.status(400).json({ error: 'Mobile number and new password are required' });
    }
  
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      const query = `UPDATE registration SET password = ? WHERE mobilenum = ?`;
      db.query(query, [hashedPassword, mobilenum], (err, results) => {
        if (err) {
          console.error('Error during password update:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
          return res.status(400).json({ error: 'Mobile number not found' });
        }
        res.status(200).json({ message: 'Password updated successfully' });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  