const mongoose = require('mongoose');

const workingHoursSchema = mongoose.Schema(
  {
    day: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openTime: {
      type: String,
      default: '09:00',
    },
    closeTime: {
      type: String,
      default: '18:00',
    },
  },
  { _id: false }
);

const holidaySchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const emailTemplateSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['booking_confirmation', 'booking_cancellation', 'admin_notification'],
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const settingSchema = mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Please add a business name'],
      default: 'Kart Booking System',
    },
    businessEmail: {
      type: String,
      required: [true, 'Please add a business email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    adminNotificationEmails: [
      {
        type: String,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email',
        ],
      },
    ],
    timeslotDuration: {
      type: Number,
      required: [true, 'Please add timeslot duration in minutes'],
      default: 30,
    },
    maxConsecutiveSlots: {
      type: Number,
      required: [true, 'Please add maximum consecutive slots'],
      default: 4,
    },
    minAdvanceBookingTime: {
      type: Number,
      required: [true, 'Please add minimum advance booking time in hours'],
      default: 2,
    },
    maxAdvanceBookingDays: {
      type: Number,
      required: [true, 'Please add maximum advance booking days'],
      default: 30,
    },
    maxKartsPerTimeslot: {
      type: Number,
      required: [true, 'Please add maximum number of karts per timeslot'],
      default: 5,
    },
    maxMinutesPerSession: {
      type: Number,
      required: [true, 'Please add maximum minutes per session'],
      default: 60,
    },
    workingHours: [workingHoursSchema],
    holidays: [holidaySchema],
    emailTemplates: [emailTemplateSchema],
    emailSettings: {
      provider: {
        type: String,
        enum: ['smtp', 'sendgrid', 'mailgun'],
        default: 'smtp',
      },
      host: String,
      port: Number,
      username: String,
      password: String,
      apiKey: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingSchema.statics.getSetting = async function () {
  let setting = await this.findOne();
  
  if (!setting) {
    setting = await this.create({
      businessName: 'Kart Booking System',
      businessEmail: 'info@kartbooking.com',
      adminNotificationEmails: ['admin@kartbooking.com'],
      workingHours: [
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
        { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
        { day: 'sunday', isOpen: false, openTime: '00:00', closeTime: '00:00' },
      ],
      emailTemplates: [
        {
          type: 'booking_confirmation',
          subject: 'Booking Confirmation',
          body: '<p>Dear {{customerName}},</p><p>Your booking has been confirmed for {{date}} from {{startTime}} to {{endTime}}.</p><p>Thank you for choosing our service!</p>',
        },
        {
          type: 'booking_cancellation',
          subject: 'Booking Cancellation',
          body: '<p>Dear {{customerName}},</p><p>Your booking for {{date}} from {{startTime}} to {{endTime}} has been cancelled.</p>',
        },
        {
          type: 'admin_notification',
          subject: 'New Booking Notification',
          body: '<p>A new booking has been made:</p><p>Customer: {{customerName}}<br>Date: {{date}}<br>Time: {{startTime}} - {{endTime}}</p>',
        },
      ],
    });
  }
  
  return setting;
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
