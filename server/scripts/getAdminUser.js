const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/userModel');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const getAdminUser = async () => {
  try {
    // Find admin users
    const adminUsers = await User.find({ isAdmin: true });

    if (adminUsers.length === 0) {
      console.log('No admin users found'.yellow.bold);
    } else {
      console.log(`Found ${adminUsers.length} admin users:`.green.bold);
      
      adminUsers.forEach((user, index) => {
        console.log(`\nAdmin User ${index + 1}:`.cyan.bold);
        console.log(`Name: ${user.name}`.cyan);
        console.log(`Email: ${user.email}`.cyan);
        console.log(`ID: ${user._id}`.cyan);
        console.log(`Created: ${user.createdAt}`.cyan);
      });
      
      console.log('\nNote: Passwords are hashed and cannot be retrieved.'.yellow);
      console.log('If you need to reset a password, use the updateAdminPassword.js script.'.yellow);
    }
    
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.bold);
    process.exit(1);
  }
};

getAdminUser();
