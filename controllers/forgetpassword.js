const bcrypt = require('bcrypt');
const db = require('../db');

exports.forgotPassword = async (req, res) => {
    const { mobilenum, email, newPassword } = req.body;

    // Validate required inputs
    if (!newPassword || (!mobilenum && !email)) {
        return res.status(400).json({ error: 'New password and either mobile number or email are required' });
    }

    if (mobilenum && email) {
        return res.status(400).json({ error: 'Provide either mobile number or email, not both' });
    }

    try {
        // Hash the new password securely
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Determine the identifier type
        const identifierType = mobilenum ? 'mobilenum' : 'email';
        const identifierValue = mobilenum || email;

        // Prepare the query for updating the password
        const query = `UPDATE registration SET password = ? WHERE ${identifierType} = ?`;

        // Execute the database update query
        db.query(query, [hashedPassword, identifierValue], (err, results) => {
            if (err) {
                console.error('Error during password update:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Check if the update affected any rows
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: `${identifierType === 'mobilenum' ? 'Mobile number' : 'Email'} not found` });
            }

            res.status(200).json({ message: 'Password updated successfully' });
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
