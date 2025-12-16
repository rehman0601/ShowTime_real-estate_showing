const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

router.post('/', auth, bookingController.createSlots);
router.get('/property/:propertyId', auth, bookingController.getSlots);
router.put('/:id/book', auth, bookingController.bookSlot);
router.put('/:id/status', auth, bookingController.updateStatus);
router.get('/my-bookings', auth, bookingController.getMyBookings);
router.get('/agent-schedule', auth, bookingController.getAgentSchedule);

module.exports = router;
