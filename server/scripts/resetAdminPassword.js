const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/userModel');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// New password for admin
const NEW_PASSWORD = 'admin123';

const resetAdminPassword = async () => {
  try {
    // Find admin user by email
    const adminUser = await User.findOne({ email: 'admin@example.com' });

    if (!adminUser) {
      console.log('Admin user not found'.red.bold);
      process.exit(1);
    }

    // Update password
    adminUser.password = NEW_PASSWORD;
    await adminUser.save();

    console.log(`Admin password reset successfully`.green.bold);
    console.log(`Email: ${adminUser.email}`.cyan);
    console.log(`New Password: ${NEW_PASSWORD}`.cyan);
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

resetAdminPassword();
