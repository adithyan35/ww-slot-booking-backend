const express = require('express');
const router = express.Router();
const turfController = require('../controllers/turfDetails');


router.post('/add-turf', turfController.addTurf);

router.get('/turfs', turfController.getTurfs);

module.exports = router;
