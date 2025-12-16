const Booking = require('../models/Booking');
const Property = require('../models/Property');

/**
 * Create available slots for a property
 * @route POST /api/bookings
 * @access Private (Agent)
 */
exports.createSlots = async (req, res) => {
  try {
    const { propertyId, startTime, endTime } = req.body;
    
    // Validate ownership
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    if (property.agentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const newBooking = new Booking({
      propertyId,
      agentId: req.user.id,
      startTime,
      endTime,
      status: 'available'
    });

    const booking = await newBooking.save();
    
    // Real-time update via Socket.io
    const io = req.app.get('io');
    io.emit('slotsUpdated', { propertyId });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get all slots for a specific property
 * @route GET /api/bookings/property/:propertyId
 * @access Public
 */
exports.getSlots = async (req, res) => {
  try {
    const slots = await Booking.find({ propertyId: req.params.propertyId }).sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Book a specific slot
 * @route POST /api/bookings/book/:id
 * @access Private (Buyer)
 */
exports.bookSlot = async (req, res) => {
  try {
    const slot = await Booking.findById(req.params.id);
    if (!slot) return res.status(404).json({ msg: 'Slot not found' });
    if (slot.status !== 'available') return res.status(400).json({ msg: 'Slot not available' });

    slot.buyerId = req.user.id;
    slot.status = 'pending';
    await slot.save();

    // Real-time update
    const io = req.app.get('io');
    io.emit('slotBooked', { 
        slotId: slot._id, 
        status: 'pending', 
        propertyId: slot.propertyId,
        agentId: slot.agentId // Add agentId so client can filter
    });

    res.json(slot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Update booking status (Confirm/Reject)
 * @route PUT /api/bookings/:id/status
 * @access Private (Agent)
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // confirmed, rejected
    const slot = await Booking.findById(req.params.id);
    if (!slot) return res.status(404).json({ msg: 'Slot not found' });
    
    if (slot.agentId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    slot.status = status;
    if (status === 'rejected') {
      slot.buyerId = undefined; 
      // Reset booking data on rejection so it becomes available again if needed, 
      // or stays rejected but cleared. Logic here implies cleared buyer.
    }
    
    await slot.save();

    // Real-time update
    const io = req.app.get('io');
    io.emit('slotStatusChanged', { slotId: slot._id, status, propertyId: slot.propertyId });

    res.json(slot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get bookings for the logged-in buyer
 * @route GET /api/bookings/my-bookings
 * @access Private (Buyer)
 */
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ buyerId: req.user.id })
            .populate('propertyId')
            .populate('agentId', 'name email');
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/**
 * Get schedule for the logged-in agent (booked/pending slots)
 * @route GET /api/bookings/agent-schedule
 * @access Private (Agent)
 */
exports.getAgentSchedule = async (req, res) => {
    try {
        const bookings = await Booking.find({ agentId: req.user.id, status: { $ne: 'available' } }).populate('propertyId').populate('buyerId', 'name email');
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
