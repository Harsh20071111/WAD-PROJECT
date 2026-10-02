const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: [0, 'Floor cannot be negative']
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD'],
      required: [true, 'Room type is required']
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    rent: {
      type: Number,
      required: [true, 'Rent is required'],
      min: [0, 'Rent cannot be negative']
    },
    amenities: [{
      type: String,
      trim: true
    }],
    photos: [{
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes
roomSchema.index({ pgId: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ pgId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
