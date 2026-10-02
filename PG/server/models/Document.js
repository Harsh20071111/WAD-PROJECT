const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: [true, 'Resident ID is required'],
    },
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    type: {
      type: String,
      enum: ['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'RENT_AGREEMENT', 'OTHER'],
      required: [true, 'Document type is required']
    },
    url: {
      type: String,
      required: [true, 'Document URL is required']
    },
    publicId: {
      type: String,
      required: [true, 'Public ID is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'VERIFIED', 'REJECTED', 'PENDING'],
      default: 'UPLOADED'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes
documentSchema.index({ residentId: 1 });
documentSchema.index({ pgId: 1 });
documentSchema.index({ residentId: 1, type: 1 });

module.exports = mongoose.model('Document', documentSchema);
