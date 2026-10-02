const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    requestNo: {
      type: String,
      required: [true, 'Request number is required'],
      trim: true,
      uppercase: true
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: [true, 'Resident ID is required'],
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      default: null
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    attachments: [{
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
    }],
    status: {
      type: String,
      enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'RESOLVED', 'CLOSED'],
      default: 'NEW'
    },
    assignedStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null
    },
    slaDueAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    requiresFeedback: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Indexes
complaintSchema.index({ pgId: 1 });
complaintSchema.index({ residentId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ pgId: 1, status: 1 });
complaintSchema.index({ requestNo: 1 }, { unique: true });

module.exports = mongoose.model('Complaint', complaintSchema);
