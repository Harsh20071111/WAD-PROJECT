const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room ID is required'],
    },
    label: {
      type: String,
      required: [true, 'Bed label is required'],
      trim: true,
      uppercase: true
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED'],
      default: 'AVAILABLE'
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
bedSchema.index({ pgId: 1 });
bedSchema.index({ roomId: 1 });
bedSchema.index({ status: 1 });
bedSchema.index({ pgId: 1, status: 1 });

module.exports = mongoose.model('Bed', bedSchema);
