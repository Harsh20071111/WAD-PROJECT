const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
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
    month: {
      type: String,
      required: [true, 'Month is required'],
      trim: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format']
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    lineItems: [
      {
        type: {
          type: String,
          enum: ['RENT', 'LATE_FEE', 'ADJUSTMENT'],
          required: true
        },
        label: {
          type: String,
          required: true,
          trim: true
        },
        amount: {
          type: Number,
          required: true
        }
      }
    ],
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, 'Paid amount cannot be negative']
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    gracePeriodUntil: { type: Date, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'FAILED'],
      default: 'PENDING'
    },
    gatewayOrderId: {
      type: String,
      trim: true,
      default: ''
    },
    transactionId: {
      type: String,
      trim: true,
      default: ''
    },
    method: {
      type: String,
      trim: true,
      default: ''
    },
    paidAt: {
      type: Date,
      default: null
    },
    reminderSentAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes
paymentSchema.index({ pgId: 1 });
paymentSchema.index({ residentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ pgId: 1, status: 1 });
paymentSchema.index({ residentId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
