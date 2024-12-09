const bcrypt = require('bcrypt');
const db = require('../db');
const otpGenerator = require('otp-generator');
const NodeCache = require('node-cache');

const otpCache = new NodeCache({ stdTTL: 60 }); // Store OTPs for 60 seconds

// Step 1: Generate and Send OTP
exports.sendOtp = async (req, res) => {
    const { mobilenum } = req.body;

    if (!mobilenum) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    // Validate Indian mobile number format
    const indianNumberRegex = /^\+91\d{10}$/;
    if (!indianNumberRegex.test(mobilenum)) {
        return res.status(400).json({ error: 'Invalid Indian mobile number. It must start with +91 and have 10 digits.' });
    }

    // Check if mobile number already exists in the database
    const checkQuery = `SELECT * FROM registration WHERE mobilenum = ?`;
    db.query(checkQuery, [mobilenum], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Mobile number already exists. Try using a new number.' });
        }

        // Generate unique OTP
        const otp_code = otpGenerator.generate(6, { upperCase: false, specialChars: false });

        // Temporarily store OTP in memory
        otpCache.set(mobilenum, otp_code);

        // Simulate sending OTP
        console.log(`OTP for ${mobilenum}: ${otp_code}`);

        res.status(200).json({ message: 'OTP sent successfully' });
    });
};

exports.verifyOtp = (req, res) => {
    const { mobilenum, otp } = req.body;

    if (!mobilenum || !otp) {
        return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    // Retrieve OTP from cache
    const cachedOtp = otpCache.get(mobilenum);

    if (!cachedOtp) {
        return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (cachedOtp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP is valid, delete it from cache
    otpCache.del(mobilenum);

    // Mark mobile number as verified in the database
    const insertQuery = `
    INSERT INTO registration (mobilenum, is_verified) 
    VALUES (?, 1) 
    ON DUPLICATE KEY UPDATE is_verified = 1;
`;
db.query(insertQuery, [mobilenum], (err) => {
    if (err) {
        console.error('Error executing query:', err.message);
        return res.status(500).json({ error: 'Database error while verifying mobile number' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
});
}



// Step 3: Complete Registration
exports.registerUser = async (req, res) => {
    const { username, mobilenum, email, password, confirmpassword } = req.body;

    if (!username || !password || !confirmpassword || (!mobilenum && !email)) {
        return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (password !== confirmpassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    const checkQuery = `
        SELECT is_verified 
        FROM registration 
        WHERE (mobilenum = ? OR email = ?) AND is_verified = 1
    `;
    db.query(checkQuery, [mobilenum, email], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Neither mobile number nor email is verified' });
        }

        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const updateQuery = `
                UPDATE registration 
                SET username = ?, email = ?, password = ?, mobilenum = ?
                WHERE (mobilenum = ? OR email = ?);
            `;
            db.query(updateQuery, [username, email, hashedPassword, mobilenum, mobilenum, email], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Registration failed' });
                }

                res.status(201).json({ message: 'User registered successfully' });
            });
        } catch (error) {
            console.error('Error hashing password:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
};
