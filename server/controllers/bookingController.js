const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const Booking = require('../models/bookingModel');
const Kart = require('../models/kartModel');
const Setting = require('../models/settingModel');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    date,
    startTime,
    endTime,
    duration,
    timeslots,
    kartSelections,
    notes,
  } = req.body;

  // Get settings for timeslot duration
  const setting = await Setting.getSetting();
  const { timeslotDuration } = setting;
  
  // Calculate total price based on actual timeslot duration
  let totalPrice = 0;
  for (const selection of kartSelections) {
    totalPrice += selection.quantity * selection.pricePerSlot * (duration / timeslotDuration);
  }
  
  // Store the selected timeslots if provided
  const selectedTimeslots = timeslots || [];

  const booking = await Booking.create({
    customerName,
    customerEmail,
    customerPhone,
    date,
    startTime,
    endTime,
    duration,
    selectedTimeslots, // Store the selected timeslots
    kartSelections,
    totalPrice,
    status: 'confirmed',
    notes,
  });

  if (booking) {
    // Send confirmation email
    await sendBookingConfirmationEmail(booking);
    
    res.status(201).json(booking);
  } else {
    res.status(400);
    throw new Error('Invalid booking data');
  }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getBookings = asyncHandler(async (req, res) => {
  const { startDate, endDate, status } = req.query;
  
  let query = {};
  
  // Filter by date range if provided
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    query.date = { $gte: new Date(startDate) };
  } else if (endDate) {
    query.date = { $lte: new Date(endDate) };
  }
  
  // Filter by status if provided
  if (status) {
    query.status = status;
  }
  
  const bookings = await Booking.find(query)
    .sort({ date: 1, startTime: 1 })
    .populate('kartSelections.kart', 'name type');
    
  res.json(bookings);
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private/Admin
const getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('kartSelections.kart');

  if (booking) {
    res.json(booking);
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private/Admin
const updateBooking = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    date,
    startTime,
    endTime,
    duration,
    kartSelections,
    status,
    notes,
  } = req.body;

  const booking = await Booking.findById(req.params.id);

  if (booking) {
    // Calculate total price if kartSelections changed
    let totalPrice = booking.totalPrice;
    if (kartSelections) {
      totalPrice = 0;
      for (const selection of kartSelections) {
        totalPrice += selection.quantity * selection.pricePerSlot * ((duration || booking.duration) / 30);
      }
    }

    booking.customerName = customerName || booking.customerName;
    booking.customerEmail = customerEmail || booking.customerEmail;
    booking.customerPhone = customerPhone || booking.customerPhone;
    booking.date = date || booking.date;
    booking.startTime = startTime || booking.startTime;
    booking.endTime = endTime || booking.endTime;
    booking.duration = duration || booking.duration;
    booking.kartSelections = kartSelections || booking.kartSelections;
    booking.totalPrice = totalPrice;
    booking.status = status || booking.status;
    booking.notes = notes !== undefined ? notes : booking.notes;

    const updatedBooking = await booking.save();
    
    // Send email notification if status changed to cancelled
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await sendBookingCancellationEmail(updatedBooking);
    }
    
    res.json(updatedBooking);
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

// @desc    Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (booking) {
    await booking.remove();
    res.json({ message: 'Booking removed' });
  } else {
    res.status(404);
    throw new Error('Booking not found');
  }
});

// @desc    Get available timeslots for a specific date
// @route   GET /api/bookings/timeslots
// @access  Public
const getAvailableTimeslots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    res.status(400);
    throw new Error('Date is required');
  }
  
  // Get current date and time
  const currentDate = new Date();
  const requestDateObj = new Date(date);
  
  // Set both dates to midnight to compare just the dates
  const currentDateMidnight = new Date(currentDate);
  currentDateMidnight.setHours(0, 0, 0, 0);
  
  const requestDateMidnight = new Date(requestDateObj);
  requestDateMidnight.setHours(0, 0, 0, 0);
  
  // If the requested date is in the past, return empty array
  if (requestDateMidnight < currentDateMidnight) {
    console.log('Requested date is in the past, returning empty array');
    return res.json([]);
  }
  
  // Get settings
  const setting = await Setting.getSetting();
  const { timeslotDuration } = setting;
  
  // Get working hours for the day
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][requestDateObj.getDay()];
  const workingHours = setting.workingHours.find(wh => wh.day === dayOfWeek);
  
  // Check if it's a holiday
  const isHoliday = setting.holidays.some(holiday => {
    const holidayDate = new Date(holiday.date);
    return holidayDate.toDateString() === requestDate.toDateString();
  });
  
  // If closed or holiday, return empty array
  if (isHoliday || !workingHours.isOpen) {
    return res.json([]);
  }
  
  // Generate all possible timeslots for the day
  const timeslots = generateTimeslots(workingHours.openTime, workingHours.closeTime, timeslotDuration);
  
  // Get all karts
  const karts = await Kart.find({ isActive: true });
  
  // Get existing bookings for the date
  const bookings = await Booking.find({
    date: {
      $gte: new Date(new Date(date).setHours(0, 0, 0)),
      $lt: new Date(new Date(date).setHours(23, 59, 59)),
    },
    status: { $ne: 'cancelled' },
  });
  
  // Get current time in HH:MM format if the requested date is today
  let currentTime = null;
  if (requestDateMidnight.getTime() === currentDateMidnight.getTime()) {
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    currentTime = `${hours}:${minutes}`;
    console.log('Current time:', currentTime);
  }
  
  // Calculate availability for each timeslot
  let availableTimeslots = timeslots.map(timeslot => {
    const { startTime } = timeslot;
    
    // Find bookings that overlap with this timeslot
    const overlappingBookings = bookings.filter(booking => {
      return booking.selectedTimeslots.some(slot => 
        slot.start <= startTime && slot.end > startTime
      ) || (booking.startTime < addMinutesToTime(startTime, timeslotDuration) && booking.startTime >= startTime);

      // return (
      //   (booking.startTime <= startTime && booking.endTime > startTime) ||
      //   (booking.startTime < addMinutesToTime(startTime, timeslotDuration) && booking.startTime >= startTime)
      // );
    });
    
    // Calculate remaining kart quantities
    const kartAvailability = karts.map(kart => {
      const bookedQuantity = overlappingBookings.reduce((total, booking) => {
        const kartSelection = booking.kartSelections.find(
          selection => selection.kart.toString() === kart._id.toString()
        );
        return total + (kartSelection ? kartSelection.quantity : 0);
      }, 0);
      
      return {
        _id: kart._id,
        name: kart.name,
        type: kart.type,
        pricePerSlot: kart.pricePerSlot,
        available: Math.max(0, kart.quantity - bookedQuantity),
        total: kart.quantity,
      };
    });
    
    // Calculate total available places for this timeslot
    const totalAvailability = kartAvailability.reduce((total, kart) => total + kart.available, 0);
    
    return {
      ...timeslot,
      kartAvailability,
      totalAvailability,
    };
  });
  
  // Filter out past timeslots if the requested date is today
  if (currentTime) {
    availableTimeslots = availableTimeslots.filter(timeslot => {
      return compareTime(timeslot.startTime, currentTime) >= 0;
    });
    console.log(`Filtered out past timeslots for today, ${availableTimeslots.length} timeslots remaining`);
  }
  
  res.json(availableTimeslots);
});

// Helper function to generate timeslots
const generateTimeslots = (openTime, closeTime, duration) => {
  const timeslots = [];
  let currentTime = openTime;
  
  while (compareTime(currentTime, closeTime) < 0) {
    const endTime = addMinutesToTime(currentTime, duration);
    
    // Don't add timeslot if it extends beyond closing time
    if (compareTime(endTime, closeTime) <= 0) {
      timeslots.push({
        startTime: currentTime,
        endTime,
      });
    }
    
    currentTime = endTime;
  }
  
  return timeslots;
};

// Helper function to add minutes to time (format: "HH:MM")
const addMinutesToTime = (time, minutes) => {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

// Helper function to compare times (format: "HH:MM")
const compareTime = (time1, time2) => {
  const [hours1, mins1] = time1.split(':').map(Number);
  const [hours2, mins2] = time2.split(':').map(Number);
  
  if (hours1 !== hours2) {
    return hours1 - hours2;
  }
  
  return mins1 - mins2;
};

// Helper function to send booking confirmation email
const sendBookingConfirmationEmail = async (booking) => {
  try {
    const setting = await Setting.getSetting();
    
    // Get email template
    const template = setting.emailTemplates.find(t => t.type === 'booking_confirmation');
    
    if (!template) {
      console.error('Booking confirmation email template not found');
      return;
    }
    
    // Format date
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('et-EE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Replace placeholders in template
    let emailBody = template.body
      .replace(/{{customerName}}/g, booking.customerName)
      .replace(/{{date}}/g, formattedDate)
      .replace(/{{startTime}}/g, booking.startTime)
      .replace(/{{endTime}}/g, booking.endTime);
    
    // Set up email transporter
    const transporter = createEmailTransporter(setting);
    
    // Send email to customer
    await transporter.sendMail({
      from: `"${setting.businessName}" <${setting.businessEmail}>`,
      to: booking.customerEmail,
      subject: template.subject,
      html: emailBody,
    });
    
    // Send notification to admin
    const adminTemplate = setting.emailTemplates.find(t => t.type === 'admin_notification');
    
    if (adminTemplate && setting.adminNotificationEmails.length > 0) {
      let adminEmailBody = adminTemplate.body
        .replace(/{{customerName}}/g, booking.customerName)
        .replace(/{{date}}/g, formattedDate)
        .replace(/{{startTime}}/g, booking.startTime)
        .replace(/{{endTime}}/g, booking.endTime);
      
      await transporter.sendMail({
        from: `"${setting.businessName}" <${setting.businessEmail}>`,
        to: setting.adminNotificationEmails.join(','),
        subject: adminTemplate.subject,
        html: adminEmailBody,
      });
    }
    
    // Update booking to mark email as sent
    booking.emailSent = true;
    await booking.save();
    
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
  }
};

// Helper function to send booking cancellation email
const sendBookingCancellationEmail = async (booking) => {
  try {
    const setting = await Setting.getSetting();
    
    // Get email template
    const template = setting.emailTemplates.find(t => t.type === 'booking_cancellation');
    
    if (!template) {
      console.error('Booking cancellation email template not found');
      return;
    }
    
    // Format date
    const bookingDate = new Date(booking.date);
    const formattedDate = bookingDate.toLocaleDateString('et-EE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    // Replace placeholders in template
    let emailBody = template.body
      .replace(/{{customerName}}/g, booking.customerName)
      .replace(/{{date}}/g, formattedDate)
      .replace(/{{startTime}}/g, booking.startTime)
      .replace(/{{endTime}}/g, booking.endTime);
    
    // Set up email transporter
    const transporter = createEmailTransporter(setting);
    
    // Send email
    await transporter.sendMail({
      from: `"${setting.businessName}" <${setting.businessEmail}>`,
      to: booking.customerEmail,
      subject: template.subject,
      html: emailBody,
    });
    
  } catch (error) {
    console.error('Error sending booking cancellation email:', error);
  }
};

// Helper function to create email transporter
const createEmailTransporter = (setting) => {
  const { emailSettings } = setting;
  
  if (emailSettings.provider === 'smtp') {
    return nodemailer.createTransport({
      host: emailSettings.host,
      port: emailSettings.port,
      secure: emailSettings.port === 465,
      auth: {
        user: emailSettings.username,
        pass: emailSettings.password,
      },
    });
  } else if (emailSettings.provider === 'sendgrid') {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: emailSettings.apiKey,
      },
    });
  } else if (emailSettings.provider === 'mailgun') {
    // For Mailgun, you would typically use their SDK instead of nodemailer
    // This is a simplified example
    return nodemailer.createTransport({
      service: 'Mailgun',
      auth: {
        user: 'postmaster@yourdomain.com',
        pass: emailSettings.apiKey,
      },
    });
  }
  
  // Default fallback
  return nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'your_mailtrap_user',
      pass: 'your_mailtrap_password',
    },
  });
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getAvailableTimeslots,
};
