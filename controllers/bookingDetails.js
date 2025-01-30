const db = require("../db");

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const {
      user_id,
      court_id,
      slot_id,
      turf_id,
      booking_date,
      booking_type,
      payment_id,
      transaction_id,
      payment_mode,
      hours_booked,
    } = req.body;

    // Calculate total slots booked
    const total_slots_booked = hours_booked;

    const bookingQuery = `
      INSERT INTO bookings 
      (user_id, court_id, slot_id, turf_id, booking_date, booking_type, payment_id, transaction_id, payment_mode, hours_booked, total_slots_booked) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const updateSlotQuery = `
      UPDATE slots 
      SET booked_slots = booked_slots + ? 
      WHERE slot_id = ?`;

    // Insert booking record
    const [result] = await db.execute(bookingQuery, [
      user_id,
      court_id,
      slot_id,
      turf_id,
      booking_date,
      booking_type,
      payment_id,
      transaction_id,
      payment_mode,
      hours_booked,
      total_slots_booked,
    ]);

    // Update slot availability
    await db.execute(updateSlotQuery, [total_slots_booked, slot_id]);

    res.status(201).json({
      message: "Booking successful",
      booking_id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user booking history
exports.getUserBookingHistory = async (req, res) => {
  try {
    const { user_id } = req.params;

    const query = `
      SELECT 
        b.booking_id, 
        b.booking_date, 
        b.booking_type, 
        b.hours_booked, 
        b.total_slots_booked,
        b.payment_id, 
        b.transaction_id, 
        b.payment_mode, 
        c.court_name, 
        t.turf_name, 
        s.slot_time 
      FROM bookings b
      INNER JOIN courts c ON b.court_id = c.court_id
      INNER JOIN turfs t ON b.turf_id = t.turf_id
      INNER JOIN slots s ON b.slot_id = s.slot_id
      WHERE b.user_id = ?`;

    const [bookings] = await db.execute(query, [user_id]);

    const totalBookings = bookings.length;

    res.status(200).json({
      totalBookings,
      bookings,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Disable slot for monthly subscription
exports.disableMonthlySubscriptionSlots = async (req, res) => {
  try {
    const { slot_id, month } = req.body;

    const query = `
      UPDATE slots 
      SET available = 0 
      WHERE slot_id = ? 
      AND MONTH(booking_date) = ?`;

    await db.execute(query, [slot_id, month]);

    res.status(200).json({ message: "Slot disabled for the month." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
