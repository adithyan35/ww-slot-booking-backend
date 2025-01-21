const bcrypt = require('bcrypt');
const db = require('../db');
const NodeCache = require('node-cache');
const jwt = require('jsonwebtoken');

const otpCache = new NodeCache({ stdTTL: 300 }); // OTP validity for 5 minutes
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Custom function to generate numeric OTP
function generateNumericOtp(length) {
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); // Generates a single digit (0-9)
    }
    return otp;
}

// Step 1: Generate and Send OTP
exports.sendOtp = async (req, res) => {
    const { mobilenum, email } = req.body;

    if (!mobilenum && !email) {
        return res.status(400).json({ error: 'Either mobile number or email is required' });
    }

    const identifier = mobilenum || email;
    const identifierType = mobilenum ? 'mobilenum' : 'email';

    const checkQuery = `SELECT * FROM registration WHERE ${identifierType} = ?`;
    db.query(checkQuery, [identifier], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length > 0 && results[0].is_verified) {
            return res.status(400).json({ error: `${identifierType === 'mobilenum' ? 'Mobile number' : 'Email'} already verified` });
        }

        // Generate numeric OTP using custom function
        const otp_code = generateNumericOtp(6); // 6-digit OTP
        otpCache.set(identifier, otp_code);
        console.log(`OTP for ${identifier}: ${otp_code}`); // For debugging

        return res.status(200).json({ message: `OTP sent successfully to your ${identifierType}` });
    });
};

// Step 2: Verify OTP
exports.verifyOtp = (req, res) => {
    const { mobilenum, email, otp } = req.body;

    if (!otp || (!mobilenum && !email)) {
        return res.status(400).json({ error: 'OTP and either mobile number or email are required' });
    }

    const identifier = mobilenum || email;
    const identifierType = mobilenum ? 'mobilenum' : 'email';
    const cachedOtp = otpCache.get(identifier);

    if (!cachedOtp) {
        return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (cachedOtp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    otpCache.del(identifier); // Delete OTP after successful verification

    const updateQuery = `UPDATE registration SET is_verified = 1 WHERE ${identifierType} = ?`;
    db.query(updateQuery, [identifier], (err) => {
        if (err) return res.status(500).json({ error: 'Database error while verifying OTP' });

        return res.status(200).json({ message: `${identifierType === 'mobilenum' ? 'Mobile number' : 'Email'} OTP verified successfully` });
    });
};

// Step 3: Register User
exports.registerUser = async (req, res) => {
    const { username, mobilenum, email, password, confirmpassword } = req.body;

    if (!username || !password || !confirmpassword || (!mobilenum && !email)) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (password !== confirmpassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    const verificationCheckQuery = `
        SELECT is_verified, mobilenum, email
        FROM registration
        WHERE mobilenum = ? OR email = ?;
    `;

    db.query(verificationCheckQuery, [mobilenum, email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        const isAnyVerified = results.some(row => row.is_verified === 1);
        if (!isAnyVerified) {
            return res.status(400).json({
                error: `Registration not allowed. Please verify either mobile number or email OTP first.`,
            });
        }

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const updateQuery = `
                UPDATE registration
                SET username = ?, password = ?, email = ?, mobilenum = ?
                WHERE mobilenum = ? OR email = ?;
            `;

            db.query(updateQuery, [username, hashedPassword, email, mobilenum, mobilenum, email], (err) => {
                if (err) return res.status(500).json({ error: 'Registration failed' });

                // Generate JWT Token after successful registration
                const token = jwt.sign({ mobilenum, email, username }, JWT_SECRET, { expiresIn: '1h' });

                return res.status(201).json({ message: 'User registered successfully', token });
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
};
