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
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Generate Numeric OTP
function generateNumericOtp(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// Format the email body professionally
function formatEmail(email, otp) {
    const currentDate = new Date().toLocaleString();
    return `
        Dear User,
        
        Thank you for initiating the verification process.
        
        Date: ${currentDate}
        
        Your OTP code is: **   ${otp}   **
        
        Please note that this OTP is valid for 4 minutes. Do not share this code with anyone for your security.
        
        Regards,
        WillWare Technologies
    `;
}

// Send OTP Email
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
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Email already exists. Try using a new email.' });
        }

        // Generate OTP and store in cache
        const otp = generateNumericOtp(6);
        emailOtpCache.set(email, otp);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Email Verification Code',
            text: formatEmail(email, otp),
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ error: 'Failed to send OTP email' });
            }

            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'OTP sent successfully to your email' });
        });
    });
};

// Verify OTP
exports.verifyEmailOtp = (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const cachedOtp = emailOtpCache.get(email);

    if (!cachedOtp) {
        return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (cachedOtp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    emailOtpCache.del(email);

    const insertQuery = `
        INSERT INTO registration (email, is_verified, mobilenum) 
        VALUES (?, 1, NULL) 
        ON DUPLICATE KEY UPDATE is_verified = 1;
    `;

    db.query(insertQuery, [email], (err) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error while verifying email' });
        }

        res.status(200).json({ message: 'Email verified successfully' });
    });
};
