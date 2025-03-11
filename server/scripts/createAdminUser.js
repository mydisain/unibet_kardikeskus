const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/userModel');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });

    if (adminExists) {
      console.log('Admin user already exists'.yellow.bold);
      process.exit();
    }

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    });

    console.log(`Admin user created: ${adminUser.name}`.green.bold);
    console.log(`Email: ${adminUser.email}`.cyan);
    console.log(`Password: password123`.cyan);
    console.log(`Admin: ${adminUser.isAdmin}`.cyan);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

createAdminUser();
