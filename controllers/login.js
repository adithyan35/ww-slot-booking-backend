const bcrypt = require('bcrypt');
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

exports.loginUser = async (req, res) => {
    const { identifier, password } = req.body;

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

            // Generate JWT Token
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ message: 'Login successful', token, user: { id: user.id, username: user.username } });
        } catch (error) {
            console.error('Error comparing password:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};

// Logout functionality
exports.logoutUser = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
      return res.status(400).json({ error: 'Token is required for logout' });
  }

  try {
     
      res.status(200).json({ message: 'Logout successful' });

  } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ error: 'Failed to logout' });
  }
};



// const bcrypt = require('bcrypt');
// const db = require('../db');
// const session = require('express-session');
// const { OAuth2Client } = require('google-auth-library');
// const jwt = require('jsonwebtoken');

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// // Traditional Login
// exports.loginUser = async (req, res) => {
//   const { identifier, password } = req.body;

//   if (!identifier || !password) {
//     return res.status(400).json({ error: 'Username or mobile number and password are required' });
//   }

//   const query = 'SELECT * FROM registration WHERE username = ? OR mobilenum = ?';
//   db.query(query, [identifier, identifier], async (err, results) => {
//     if (err) {
//       console.error('Database query error:', err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }

//     if (results.length === 0) {
//       return res.status(400).json({ error: 'Invalid username, mobile number, or password' });
//     }

//     const user = results[0];
//     try {
//       const match = await bcrypt.compare(password, user.password);
//       if (!match) {
//         return res.status(400).json({ error: 'Invalid username, mobile number, or password' });
//       }

//       const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
//       res.status(200).json({ message: 'Login successful', token, user: { id: user.id, username: user.username } });
//     } catch (error) {
//       console.error('Error comparing password:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });
// };

// // Google Login
// exports.googleLogin = async (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     return res.status(400).json({ error: 'Google token is required' });
//   }

//   try {
//     // Verify Google token
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, name, picture } = payload;

//     // Check if user exists
//     const checkQuery = 'SELECT * FROM registration WHERE email = ?';
//     db.query(checkQuery, [email], (err, results) => {
//       if (err) {
//         console.error('Database error:', err);
//         return res.status(500).json({ error: 'Internal server error' });
//       }

//       if (results.length > 0) {
//         // Existing user
//         const user = results[0];
//         const jwtToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         return res.status(200).json({ message: 'Login successful', token: jwtToken, user });
//       } else {
//         // New user - Register
//         const insertQuery = 'INSERT INTO registration (username, email, profile_picture, is_verified) VALUES (?, ?, ?, 1)';
//         db.query(insertQuery, [name, email, picture], (insertErr, insertResults) => {
//           if (insertErr) {
//             console.error('Database error while registering user:', insertErr);
//             return res.status(500).json({ error: 'Internal server error' });
//           }

//           const userId = insertResults.insertId;
//           const jwtToken = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
//           res.status(201).json({ message: 'User registered and logged in', token: jwtToken, user: { id: userId, email, name, picture } });
//         });
//       }
//     });
//   } catch (error) {
//     console.error('Google authentication error:', error);
//     res.status(400).json({ error: 'Invalid Google token' });
//   }
// };

// // Logout functionality
// exports.logoutUser = (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error('Error during logout:', err);
//       return res.status(500).json({ error: 'Failed to logout' });
//     }
//     res.status(200).json({ message: 'User logged out successfully' });
//   });
// };
