const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate-showings')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    console.log('Data Cleared');

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const agent = new User({
      name: 'John Agent',
      email: 'agent@example.com',
      password,
      role: 'agent'
    });
    await agent.save();

    const buyer = new User({
      name: 'Jane Buyer',
      email: 'buyer@example.com',
      password,
      role: 'buyer'
    });
    await buyer.save();
    console.log('Users Created');

    // Create Properties
    const properties = [
      {
        title: 'Modern Beachfront Villa',
        address: '123 Ocean Dr, Miami, FL',
        price: 2500000,
        description: 'Stunning 5-bedroom villa with direct beach access, infinity pool, and panoramic ocean views.',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000',
        agentId: agent._id
      },
      {
        title: 'Luxury Downtown Penthouse',
        address: '456 Skyline Ave, New York, NY',
        price: 1800000,
        description: 'Top-floor penthouse with floor-to-ceiling windows, private terrace, and smart home integration.',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000',
        agentId: agent._id
      },
      {
        title: 'Cozy Mountain Retreat',
        address: '789 Alpine Way, Aspen, CO',
        price: 850000,
        description: 'Charming warm cabin perfect for winter getaways, featuring stone fireplace and hot tub.',
        image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000',
        agentId: agent._id
      },
      {
        title: 'Suburban Family Mansion',
        address: '321 Maple St, Beverly Hills, CA',
        price: 1200000,
        description: 'Spacious 6-bedroom home with large backyard, home theater, and gourmet kitchen.',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000',
        agentId: agent._id
      }
    ];

    await Property.insertMany(properties);
    console.log('Properties Created');

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
