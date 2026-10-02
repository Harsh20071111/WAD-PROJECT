const mongoose = require('mongoose');

const residentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true
    },
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      trim: true
    },
    dob: {
      type: Date
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      },
      relation: {
        type: String,
        trim: true
      }
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining date is required'],
      default: Date.now
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null
    },
    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      default: null
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: [0, 'Monthly rent cannot be negative']
    },
    securityDeposit: {
      type: Number,
      default: 0,
      min: [0, 'Security deposit cannot be negative']
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'NOTICE_PERIOD', 'CHECKED_OUT', 'PENDING_VERIFICATION'],
      default: 'PENDING_VERIFICATION'
    }
  },
  {
    timestamps: true
  }
);

// Indexes — userId unique handled by field-level declaration; only add compound/non-duplicate
residentSchema.index({ pgId: 1 });
residentSchema.index({ status: 1 });
residentSchema.index({ pgId: 1, status: 1 });

module.exports = mongoose.model('Resident', residentSchema);
