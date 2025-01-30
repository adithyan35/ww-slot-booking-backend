const db = require('../db');

// Add Turf
exports.addTurf = (req, res) => {
  const { trufName, OwnerName, description, amenities, location, image1, image2, image3, image4, image5 } = req.body;

  // Validate required fields
  if (!trufName || !OwnerName || !description || !amenities || !location) {
    return res.status(400).send("Missing required fields");
  }

  const query = `
    INSERT INTO trufdetails (trufName, OwnerName, description, amenities, location, image1, image2, image3, image4, image5)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [trufName, OwnerName, description, amenities, location, image1, image2, image3, image4, image5],
    (err, result) => {
      if (err) {
        console.error("Database Error:", err); // Log the error for debugging
        return res.status(500).send("Error adding turf");
      }
      res.status(201).send({ message: "Turf added successfully", id: result.insertId });
    }
  );
};

// Get All Turfs
exports.getTurfs = (req, res) => {
  const query = 'SELECT * FROM trufdetails';

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).send("Error fetching turfs");
    }
    res.status(200).send(results);
  });
};
