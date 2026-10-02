const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator ID is required']
    },
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
noticeSchema.index({ pgId: 1 });
noticeSchema.index({ pgId: 1, isActive: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
