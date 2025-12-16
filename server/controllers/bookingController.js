const Booking = require('../models/Booking');
const Property = require('../models/Property');

// Create available slots (Agent)
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
    
    // Real-time update
    const io = req.app.get('io');
    io.emit('slotsUpdated', { propertyId });

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get slots for a property
exports.getSlots = async (req, res) => {
  try {
    const slots = await Booking.find({ propertyId: req.params.propertyId }).sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Book a slot (Buyer)
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
    io.emit('slotBooked', { slotId: slot._id, status: 'pending', propertyId: slot.propertyId });

    res.json(slot);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update status (Agent: Confirm/Reject)
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
      slot.buyerId = undefined; // Clear buyer if rejected? Or keep record? 
      // Requirement says "approve or reject", usually implies keeping the record but status rejected.
      // If rejected, maybe it becomes available again? 
      // Let's assume rejected means the booking is dead. If agent wants to make it available, they create a new slot or we add logic to reset.
      // Simplest: Rejected slot stays rejected.
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

// Get my bookings (Buyer)
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ buyerId: req.user.id }).populate('propertyId');
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get my schedule (Agent) - slots that are booked or pending
exports.getAgentSchedule = async (req, res) => {
    try {
        const bookings = await Booking.find({ agentId: req.user.id, status: { $ne: 'available' } }).populate('propertyId').populate('buyerId', 'name email');
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
