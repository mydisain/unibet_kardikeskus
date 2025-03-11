const asyncHandler = require('express-async-handler');
const Setting = require('../models/settingModel');

// @desc    Get settings
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = asyncHandler(async (req, res) => {
  const setting = await Setting.getSetting();
  res.json(setting);
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const setting = await Setting.getSetting();
  
  const {
    businessName,
    businessEmail,
    adminNotificationEmails,
    timeslotDuration,
    maxConsecutiveSlots,
    minAdvanceBookingTime,
    maxAdvanceBookingDays,
    maxKartsPerTimeslot,
    maxMinutesPerSession,
    workingHours,
    holidays,
    emailTemplates,
    emailSettings,
  } = req.body;
  
  if (setting) {
    setting.businessName = businessName || setting.businessName;
    setting.businessEmail = businessEmail || setting.businessEmail;
    setting.adminNotificationEmails = adminNotificationEmails || setting.adminNotificationEmails;
    setting.timeslotDuration = timeslotDuration !== undefined ? timeslotDuration : setting.timeslotDuration;
    setting.maxConsecutiveSlots = maxConsecutiveSlots !== undefined ? maxConsecutiveSlots : setting.maxConsecutiveSlots;
    setting.minAdvanceBookingTime = minAdvanceBookingTime !== undefined ? minAdvanceBookingTime : setting.minAdvanceBookingTime;
    setting.maxAdvanceBookingDays = maxAdvanceBookingDays !== undefined ? maxAdvanceBookingDays : setting.maxAdvanceBookingDays;
    setting.maxKartsPerTimeslot = maxKartsPerTimeslot !== undefined ? maxKartsPerTimeslot : setting.maxKartsPerTimeslot;
    setting.maxMinutesPerSession = maxMinutesPerSession !== undefined ? maxMinutesPerSession : setting.maxMinutesPerSession;
    
    if (workingHours) {
      setting.workingHours = workingHours;
    }
    
    if (holidays) {
      setting.holidays = holidays;
    }
    
    if (emailTemplates) {
      setting.emailTemplates = emailTemplates;
    }
    
    if (emailSettings) {
      setting.emailSettings = {
        ...setting.emailSettings,
        ...emailSettings,
      };
    }
    
    const updatedSetting = await setting.save();
    res.json(updatedSetting);
  } else {
    res.status(404);
    throw new Error('Settings not found');
  }
});

// @desc    Add holiday
// @route   POST /api/settings/holidays
// @access  Private/Admin
const addHoliday = asyncHandler(async (req, res) => {
  const { date, description } = req.body;
  
  if (!date || !description) {
    res.status(400);
    throw new Error('Date and description are required');
  }
  
  const setting = await Setting.getSetting();
  
  // Check if holiday already exists
  const holidayExists = setting.holidays.some(
    h => new Date(h.date).toDateString() === new Date(date).toDateString()
  );
  
  if (holidayExists) {
    res.status(400);
    throw new Error('Holiday already exists for this date');
  }
  
  setting.holidays.push({ date, description });
  await setting.save();
  
  res.status(201).json(setting.holidays);
});

// @desc    Remove holiday
// @route   DELETE /api/settings/holidays
// @access  Private/Admin
const removeHoliday = asyncHandler(async (req, res) => {
  const { date } = req.body;
  
  if (!date) {
    res.status(400);
    throw new Error('Date is required');
  }
  
  const setting = await Setting.getSetting();
  
  const dateToRemove = new Date(date).toDateString();
  
  setting.holidays = setting.holidays.filter(
    h => new Date(h.date).toDateString() !== dateToRemove
  );
  
  await setting.save();
  
  res.json(setting.holidays);
});

// @desc    Update email template
// @route   PUT /api/settings/email-templates/:type
// @access  Private/Admin
const updateEmailTemplate = asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { subject, body } = req.body;
  
  if (!subject || !body) {
    res.status(400);
    throw new Error('Subject and body are required');
  }
  
  const setting = await Setting.getSetting();
  
  const templateIndex = setting.emailTemplates.findIndex(t => t.type === type);
  
  if (templateIndex === -1) {
    res.status(404);
    throw new Error('Email template not found');
  }
  
  setting.emailTemplates[templateIndex] = {
    type,
    subject,
    body,
  };
  
  await setting.save();
  
  res.json(setting.emailTemplates[templateIndex]);
});

// @desc    Test email configuration
// @route   POST /api/settings/test-email
// @access  Private/Admin
const testEmailConfiguration = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400);
    throw new Error('Email address is required');
  }
  
  const setting = await Setting.getSetting();
  
  // Create nodemailer transporter
  const nodemailer = require('nodemailer');
  let transporter;
  
  try {
    if (setting.emailSettings.provider === 'smtp') {
      transporter = nodemailer.createTransport({
        host: setting.emailSettings.host,
        port: setting.emailSettings.port,
        secure: setting.emailSettings.port === 465,
        auth: {
          user: setting.emailSettings.username,
          pass: setting.emailSettings.password,
        },
      });
    } else if (setting.emailSettings.provider === 'sendgrid') {
      transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: setting.emailSettings.apiKey,
        },
      });
    } else if (setting.emailSettings.provider === 'mailgun') {
      transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: 'postmaster@yourdomain.com',
          pass: setting.emailSettings.apiKey,
        },
      });
    } else {
      throw new Error('Invalid email provider');
    }
    
    // Send test email
    await transporter.sendMail({
      from: `"${setting.businessName}" <${setting.businessEmail}>`,
      to: email,
      subject: 'Test Email from Kart Booking System',
      html: '<p>This is a test email from your Kart Booking System. If you received this, your email configuration is working correctly.</p>',
    });
    
    res.json({ message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500);
    throw new Error(`Failed to send test email: ${error.message}`);
  }
});

module.exports = {
  getSettings,
  updateSettings,
  addHoliday,
  removeHoliday,
  updateEmailTemplate,
  testEmailConfiguration,
};
