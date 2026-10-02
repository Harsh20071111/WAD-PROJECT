const mongoose = require('mongoose');

const complaintUpdateSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint ID is required'],
    },
    fromStatus: {
      type: String,
      required: [true, 'From status is required'],
      enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED']
    },
    toStatus: {
      type: String,
      required: [true, 'To status is required'],
      enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED']
    },
    note: {
      type: String,
      trim: true,
      default: ''
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor ID is required']
    }
  },
  {
    timestamps: true
  }
);

// Indexes
complaintUpdateSchema.index({ complaintId: 1 });

module.exports = mongoose.model('ComplaintUpdate', complaintUpdateSchema);
