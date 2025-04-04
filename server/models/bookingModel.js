const mongoose = require('mongoose');

const kartSelectionSchema = mongoose.Schema(
  {
    kart: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Kart',
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    pricePerSlot: {
      type: Number,
      required: true,
    },
    timeslot: {
      type: String,
      required: false,
    },
  },
  { _id: false }
);

const bookingSchema = mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Please add a customer name'],
    },
    customerEmail: {
      type: String,
      required: [true, 'Please add a customer email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    customerPhone: {
      type: String,
      required: [true, 'Please add a customer phone number'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a booking date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please add a start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please add an end time'],
    },
    selectedTimeslots: {
      type: [String],
      default: [],
    },
    duration: {
      type: Number,
      required: [true, 'Please add duration in minutes'],
    },
    kartSelections: [kartSelectionSchema],
    timeslotKartSelections: {
      type: Map,
      of: [String],
      default: {},
    },
    timeslotKartQuantities: {
      type: Map,
      of: Map,
      default: {},
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
