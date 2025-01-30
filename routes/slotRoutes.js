const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotDetails");

router.post("/add-slots", slotController.addSlotsForCourt);
router.get("/by-date", slotController.getSlotsByDate);
// router.post("/book", slotController.bookSlot);
// router.get("/check-subscription", slotController.checkSlotSubscription);

module.exports = router;

