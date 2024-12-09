const nodemailer = require('nodemailer');
const db = require('../db');
const otpGenerator = require('otp-generator');
const NodeCache = require('node-cache');

// Cache to store OTPs for 240 seconds (4 minutes)
const emailOtpCache = new NodeCache({ stdTTL: 240 });

// Configure Nodemailer transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // From .env
        pass: process.env.EMAIL_PASS, // From .env
    },
});

// Step 1: Generate and Send OTP for Email
exports.sendEmailOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists in the database
    const checkQuery = `SELECT * FROM registration WHERE email = ?`;
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error while checking email:', err); // Log database errors
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists. Try using a new email.' });
        }

        // Generate unique OTP
        const otp_code = otpGenerator.generate(6, { upperCase: false, specialChars: false });

        // Temporarily store OTP in memory
        emailOtpCache.set(email, otp_code);

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp_code}. It is valid for 4 minutes.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error); // Log email sending errors
                return res.status(500).json({ error: 'Failed to send OTP email', details: error.message });
            }

            console.log('Email sent: ' + info.response); // Log successful email sending
            res.status(200).json({ message: 'OTP sent successfully to your email' });
        });
    });
};

// Step 2: Verify OTP for Email
exports.verifyEmailOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Retrieve OTP from cache
    const cachedOtp = emailOtpCache.get(email);

    if (!cachedOtp) {
        return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (cachedOtp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP is valid, delete it from cache
    emailOtpCache.del(email);

    // Mark email as verified in the database
    const insertQuery = `
        INSERT INTO registration (email, is_verified, mobilenum) 
        VALUES (?, 1, NULL) 
        ON DUPLICATE KEY UPDATE is_verified = 1;
    `;
    db.query(insertQuery, [email], (err, results) => {
        if (err) {
            console.error('Database error while inserting/updating email:', err);
            return res.status(500).json({ error: 'Database error while verifying email', details: err.message });
        }

        console.log(`Email verified successfully: ${email}`);
        res.status(200).json({ message: 'Email OTP verified successfully' });
    });
};


