const express = require("express");
const {
  createBooking,
  getUserBookingHistory,
  disableMonthlySubscriptionSlots,
} = require("../controllers/bookingDetails");
const router = express.Router();

router.post("/create", createBooking);
router.get("/history/:user_id", getUserBookingHistory);
router.post("/disable-subscription", disableMonthlySubscriptionSlots);

module.exports = router;
