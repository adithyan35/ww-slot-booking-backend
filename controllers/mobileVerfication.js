const NodeCache = require('node-cache');
const db = require('../db');

// Cache to store OTPs for 300 seconds (5 minutes)
const mobileOtpCache = new NodeCache({ stdTTL: 300 });

// Generate Numeric OTP
function generateNumericOtp(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

// Step 1: Send OTP
exports.sendMobileOtp = (req, res) => {
    const { mobilenum } = req.body;

    if (!mobilenum) {
        return res.status(400).json({ error: 'Mobile number is required' });
    }

    const checkQuery = `SELECT * FROM registration WHERE mobilenum = ?`;
    db.query(checkQuery, [mobilenum], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (results.length > 0 && results[0].is_verified) {
            return res.status(400).json({ error: 'Mobile number already verified' });
        }

        const otp = generateNumericOtp(6);
        mobileOtpCache.set(mobilenum, otp);

        console.log(`OTP for ${mobilenum}: ${otp}`); // Replace this with SMS sending logic

        res.status(200).json({ message: 'OTP sent successfully to your mobile number' });
    });
};

// Step 2: Verify OTP
exports.verifyMobileOtp = (req, res) => {
    const { mobilenum, otp } = req.body;

    if (!mobilenum || !otp) {
        return res.status(400).json({ error: 'Mobile number and OTP are required' });
    }

    const cachedOtp = mobileOtpCache.get(mobilenum);

    if (!cachedOtp) {
        return res.status(400).json({ error: 'OTP expired or invalid' });
    }

    if (cachedOtp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP' });
    }

    mobileOtpCache.del(mobilenum);

    const updateQuery = `UPDATE registration SET is_verified = 1 WHERE mobilenum = ?`;
    db.query(updateQuery, [mobilenum], (err) => {
        if (err) return res.status(500).json({ error: 'Database error while verifying OTP' });

        res.status(200).json({ message: 'Mobile number verified successfully' });
    });
};
