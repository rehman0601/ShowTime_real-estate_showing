const Property = require('../models/Property');

exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('agentId', 'name email');
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getAgentProperties = async (req, res) => {
    try {
      const properties = await Property.find({ agentId: req.user.id });
      res.json(properties);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  };

exports.createProperty = async (req, res) => {
  try {
    const { title, address, description, price } = req.body;
    let imageUrl = '';

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

// Update and Delete can be added if needed
