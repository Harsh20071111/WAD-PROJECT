const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resident',
      required: [true, 'Resident ID is required'],
    },
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
      sparse: true
    },
    type: {
      type: String,
      enum: ['COMPLAINT_FEEDBACK', 'GENERAL'],
      required: [true, 'Feedback type is required']
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Indexes — complaintId sparse handled by field-level declaration
feedbackSchema.index({ pgId: 1 });
feedbackSchema.index({ residentId: 1 });
feedbackSchema.index({ residentId: 1, complaintId: 1 }, { sparse: true, unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
