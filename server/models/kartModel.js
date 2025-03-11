const mongoose = require('mongoose');

const kartSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a kart name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    type: {
      type: String,
      required: [true, 'Please add a kart type'],
      enum: ['Adult', 'Child', 'Duo', 'Racing', 'Beginner', 'täiskasvanu kart', 'adult', 'child', 'duo', 'racing', 'beginner'],
    },
    image: {
      type: String,
      default: '/images/default-kart.jpg',
    },
    pricePerSlot: {
      type: Number,
      required: [true, 'Please add a price per timeslot'],
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Please add quantity'],
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Kart = mongoose.model('Kart', kartSchema);

module.exports = Kart;
