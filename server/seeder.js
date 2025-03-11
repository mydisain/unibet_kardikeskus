const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const colors = require('colors');

// Load models
const User = require('./models/userModel');
const Kart = require('./models/kartModel');
const KartType = require('./models/kartTypeModel');
const Setting = require('./models/settingModel');

// Load sample data
const kartTypes = require('./data/kartTypes');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create admin user and initial data
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Kart.deleteMany();
    await KartType.deleteMany();
    await Setting.deleteMany();

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: '123456', // Let the model's pre-save hook handle the hashing
      isAdmin: true,
    });
    
    console.log('Admin user created:', {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      isAdmin: adminUser.isAdmin
    });

    // Create sample karts
    const karts = [
      {
        name: 'Adult Kart 1',
        description: 'Standard adult kart with 200cc engine',
        type: 'adult',
        status: 'available',
        pricePerSlot: 25,
        quantity: 2
      },
      {
        name: 'Adult Kart 2',
        description: 'Premium adult kart with 250cc engine',
        type: 'adult',
        status: 'available',
        pricePerSlot: 30,
        quantity: 1
      },
      {
        name: 'Child Kart 1',
        description: 'Safe and fun kart for children',
        type: 'child',
        status: 'available',
        pricePerSlot: 20,
        quantity: 3
      },
    ];

    await Kart.insertMany(karts);

    // Create kart types
    await KartType.insertMany(kartTypes);

    // Create default settings
    const settings = {
      businessName: 'Kart Booking System',
      businessEmail: 'info@kartbooking.com',
      adminNotificationEmails: ['admin@kartbooking.com'],
      timeslotDuration: 30, // minutes
      maxConsecutiveSlots: 4,
      minAdvanceBookingTime: 2, // hours
      maxAdvanceBookingDays: 30,
      workingHours: [
        { day: 'monday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'tuesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'wednesday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'thursday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'friday', isOpen: true, openTime: '10:00', closeTime: '20:00' },
        { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '18:00' },
        { day: 'sunday', isOpen: false, openTime: '10:00', closeTime: '18:00' }
      ],
      holidays: [],
      emailTemplates: [
        {
          type: 'booking_confirmation',
          subject: 'Booking Confirmation',
          body: 'Dear {{name}},\n\nYour booking has been confirmed for {{date}} at {{time}}.\n\nThank you for choosing our kart service!',
        },
        {
          type: 'booking_cancellation',
          subject: 'Booking Cancellation',
          body: 'Dear {{name}},\n\nYour booking for {{date}} at {{time}} has been cancelled.\n\nWe hope to see you again soon!',
        },
        {
          type: 'admin_notification',
          subject: 'New Booking Notification',
          body: 'A new booking has been made.\n\nBooking details:\nName: {{name}}\nDate: {{date}}\nTime: {{time}}',
        }
      ],
      emailConfig: {
        host: process.env.EMAIL_HOST || '',
        port: process.env.EMAIL_PORT || '',
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    };

    await Setting.create(settings);

    console.log('Data Imported!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Delete all data
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Kart.deleteMany();
    await Setting.deleteMany();

    console.log('Data Destroyed!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Run script based on command line argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
