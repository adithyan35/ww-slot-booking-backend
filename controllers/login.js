const bcrypt = require('bcrypt');
const db = require('../db');

exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body; // 'identifier' can be username or mobile number

  // Check if identifier and password are provided
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Username or mobile number and password are required' });
  }

  // Query to check for user by username or mobile number
  const query = 'SELECT * FROM registration WHERE username = ? OR mobilenum = ?';
  
  db.query(query, [identifier, identifier], async (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.log(`No user found for identifier: ${identifier}`);
      return res.status(400).json({ error: 'Invalid username, mobile number, or password' });
    }

    const user = results[0];
    console.log('Retrieved user:', user);

    try {
      // Compare the password with the hashed password in the database
      const match = await bcrypt.compare(password, user.password);
      console.log('Password match:', match);
      if (!match) {
        return res.status(400).json({ error: 'Invalid username, mobile number, or password' });
      }

      // Respond with a success message
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error('Error comparing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
