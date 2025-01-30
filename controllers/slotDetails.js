const db = require("../db");

// Check if a year is a leap year
function isLeapYear(year) {
  return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
}

// Validate the provided date
function isValidDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  
  // Check if the year, month, and day are valid numbers
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }

  // Check if the month is between 1 and 12
  if (month < 1 || month > 12) {
    return false;
  }

  // Get the number of days in the given month and year
  const daysInMonth = new Date(year, month, 0).getDate();

  // Check if the day is within the range of valid days for the given month
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  return true;
}

// Create time slots from 6 AM to 11 PM (1-hour slots)
exports.addSlotsForCourt = (req, res) => {
  const { court_id } = req.body;

  if (!court_id) {
    return res.status(400).json({ error: "Court ID is required" });
  }

  let slots = [];
  for (let hour = 6; hour < 23; hour++) {
    const start_time = `${hour}:00:00`;
    const end_time = `${hour + 1}:00:00`;
    slots.push([court_id, start_time, end_time, 1, 0, 0]); // available_slots = 1, booked_slots = 0, is_subscribed = 0
  }

  const query = "INSERT INTO Slots (court_id, start_time, end_time, available_slots, booked_slots, is_subscribed) VALUES ?";
  db.query(query, [slots], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: "Slots added successfully!" });
  });
};

// Get available and booked slots for a specific date
exports.getSlotsByDate = (req, res) => {
  const { court_id, date } = req.query;

  if (!court_id || !date) {
    return res.status(400).json({ error: "Court ID and Date are required" });
  }

  // Validate if the provided date is a valid date
  if (!isValidDate(date)) {
    return res.status(400).json({ error: "Invalid date (e.g., this date does not exist)" });
  }

  const query = `
    SELECT slot_id, start_time, end_time, available_slots, booked_slots, is_subscribed 
    FROM Slots 
    WHERE court_id = ? AND (available_slots > 0 OR booked_slots > 0)`;

  db.query(query, [court_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(results);
  });
};

// Book a slot for a single day or monthly basis
// exports.bookSlot = (req, res) => {
//   const { slot_id, is_monthly } = req.body;

//   if (!slot_id) {
//     return res.status(400).json({ error: "Slot ID is required" });
//   }

//   const query = is_monthly
//     ? "UPDATE Slots SET is_subscribed = 1, booked_slots = booked_slots + 1 WHERE slot_id = ?"
//     : "UPDATE Slots SET booked_slots = booked_slots + 1 WHERE slot_id = ?";

//   db.query(query, [slot_id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.status(200).json({ message: is_monthly ? "Slot subscribed successfully!" : "Slot booked successfully!" });
//   });
// };

// Check if a slot is booked for all dates
// exports.checkSlotSubscription = (req, res) => {
//   const { slot_id } = req.query;

//   if (!slot_id) {
//     return res.status(400).json({ error: "Slot ID is required" });
//   }

//   const query = "SELECT is_subscribed FROM Slots WHERE slot_id = ?";
//   db.query(query, [slot_id], (err, result) => {
//     if (err) {
//       return res.status(500).json({ error: err.message });
//     }
//     res.status(200).json({ is_subscribed: result[0]?.is_subscribed });
//   });
// };
