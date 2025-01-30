const express = require("express");
const router = express.Router();
const courtController = require("../controllers/courtDetails");
const multer = require("multer");

// Configure Multer to upload images locally
const upload = multer({ dest: "uploads/" });

router.post("/addCourts", upload.single("court_image"), courtController.addCourt);
router.get("/court", courtController.getCourts);
router.get("/courts/:turfId", courtController.getCourtsByTurf);

module.exports = router;
