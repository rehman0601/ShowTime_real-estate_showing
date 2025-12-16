const Property = require('../models/Property');

/**
 * Get all properties
 * @route GET /api/properties
 * @access Public
 */
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('agentId', 'name email');
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get properties for logged-in agent
 * @route GET /api/properties/my-properties
 * @access Private (Agent)
 */
exports.getAgentProperties = async (req, res) => {
    try {
      const properties = await Property.find({ agentId: req.user.id });
      res.json(properties);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

/**
 * Create a new property
 * @route POST /api/properties
 * @access Private (Agent)
 */
exports.createProperty = async (req, res) => {
  try {
    const { title, address, description, price } = req.body;
    let imageUrl = '';

    // Handle image upload or raw URL
    if (req.file) {
        imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    } else if (req.body.image) {
        imageUrl = req.body.image; // Fallback to URL if string provided
    }

    const newProperty = new Property({
      title,
      address,
      description,
      price,
      image: imageUrl,
      agentId: req.user.id
    });

    const property = await newProperty.save();
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * Get single property by ID
 * @route GET /api/properties/:id
 * @access Public
 */
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('agentId', 'name email');
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Property not found' });
    res.status(500).send('Server Error');
  }
};

/**
 * Delete a property
 * @route DELETE /api/properties/:id
 * @access Private (Agent)
 */
exports.deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }

        // Check user authorization
        if (property.agentId.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Delete associated bookings first to prevent orphans
        const Booking = require('../models/Booking');
        await Booking.deleteMany({ propertyId: req.params.id });

        await property.deleteOne();

        res.json({ msg: 'Property removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).send('Server Error');
    }
};
