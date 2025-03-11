const mongoose = require('mongoose');

const kartTypeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a type name'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
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

const KartType = mongoose.model('KartType', kartTypeSchema);

module.exports = KartType;
