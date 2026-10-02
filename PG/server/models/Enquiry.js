const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
      sparse: true
    },
    moveInDate: {
      type: Date,
      default: null
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    source: { type: String, trim: true, default: 'WEBSITE' },
    followUpAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['NEW', 'CONTACTED', 'CONVERTED', 'CLOSED'],
      default: 'NEW'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
enquirySchema.index({ pgId: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ pgId: 1, status: 1 });

module.exports = mongoose.model('Enquiry', enquirySchema);
