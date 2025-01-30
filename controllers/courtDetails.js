const db = require("../db");
const multer = require("multer");
const path = require("path");

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store images in "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    },
});

const upload = multer({ storage: storage });

// Create a court with local image upload
exports.addCourt = (req, res) => {
    upload.single("court_image")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: "Image upload failed" });
        }

        // Destructure the request body
        const truf_id = req.body.truf_id || req.body.turfId;
        const court_name = req.body.court_name || req.body.courtName;
        const description = req.body.description || req.body.desc;
        const court_image = req.file ? req.file.path : null; // Store the file path

        // Check if required fields are provided
        if (!truf_id || !court_name || !description || !court_image) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // SQL query to insert the new court
        const query = "INSERT INTO courts (truf_id, court_name, description, court_image) VALUES (?, ?, ?, ?)";
        db.query(query, [truf_id, court_name, description, court_image], (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Error adding court" });
            }
            res.status(201).json({ message: "Court added successfully!", courtId: result.insertId });
        });
    });
};

// Get all courts
exports.getCourts = (req, res) => {
    db.query("SELECT * FROM courts", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};

// Get courts by turfId
exports.getCourtsByTurf = (req, res) => {
    const { turfId } = req.params;

    const query = "SELECT * FROM courts WHERE truf_id = ?";
    db.query(query, [turfId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error fetching courts");
        }
        res.status(200).send(results);
    });
};
