const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const addAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    const existingAdmin = await User.findOne({ username: 'Jayesh_01' });
    if (existingAdmin) {
      console.log('Admin user Jayesh_01 already exists.');
      process.exit(0);
    }

    const newAdmin = await User.create({
      username: 'Jayesh_01',
      firstName: 'Jayesh',
      lastName: 'Admin',
      password: 'jayesh123',
      genres: ['pop', 'rock', 'hiphop', 'electronic'],
      isAdmin: true,
    });

    console.log(`Admin user successfully created: ${newAdmin.username}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

addAdmin();
