const bcrypt = require('bcrypt');
const db = require('../db');

exports.registerUser = async (req, res) => {
  const { username, mobilenum, email, password, confirmpassword, otp_code } = req.body;

  // Check if the passwords match
  if (password !== confirmpassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  try {
    // Check if the password is provided
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Hash the password (data and salt arguments)
    const saltRounds = 10; // Define salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Ensure both arguments are passed

    // Log the hashed password for debugging
    console.log("Hashed password:", hashedPassword);

    // SQL query to insert the user into the 'registration' table
    const query = `INSERT INTO registration (username, mobilenum, email, password, otp_code) VALUES (?, ?, ?, ?, ?)`;

    // Execute the query
    db.query(query, [username, mobilenum, email, hashedPassword, otp_code], (err, results) => {
      if (err) {
        console.error('Error executing query:', err); // Log the error from the query
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Username, mobile number, or email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      console.log("User registered successfully:", results); // Log the successful result
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    console.error('Error in registration process:', error); // Log any other errors
    res.status(500).json({ error: 'Internal server error' });
  }
};
