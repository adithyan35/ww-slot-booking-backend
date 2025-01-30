const express = require('express');
const { loginUser, logoutUser } = require('../controllers/login');
const { forgotPassword } = require('../controllers/forgetpassword');
const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);

// router.post('/add_recruiter', (req, res) => {
//     const { name, age, city, address, phone } = req.body;
//     if (!name || !age || !city || !address || !phone) {
//         return res.status(400).json({ error: 'All fields are required' });
//     }
//     const query = `insert into rectable (name,age,city,address,phone) values(?, ?, ?, ?, ?)`;
//     db.query(query, [name, age, city, address, phone], (err, result) => {
//         if (err) {
//             console.log('databese error', err.message);
//             return res.status(500).json({ error: err.message })
//         }
//         res.status(201).json({ message: 'data added success fully', id: result.insertId });
//     })
// })

// router.get('/recruiter', (req, res) => {

//     const query = 'select * from rectable';
//     db.query(query, (err, results) => {
//         if (err) {
//             console.log('databese error', err.message);
//             return res.status(500).json({ error: err.message })
//         }
//         if (results.length === 0) {
//             return res.status(404).json({ error: 'No users found' });
//         }
//         console.log(results);
//         res.status(200).json(results);
//     })
// })

module.exports = router;
