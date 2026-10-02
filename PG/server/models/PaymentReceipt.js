const mongoose = require('mongoose');

const paymentReceiptSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      required: [true, 'Payment ID is required'],
    },
    receiptNumber: {
      type: String,
      required: [true, 'Receipt number is required'],
      trim: true
    },
    residentSnapshot: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String
      },
      roomNumber: {
        type: String
      },
      bedLabel: {
        type: String
      }
    },
    pgSnapshot: {
      name: {
        type: String,
        required: true
      },
      address: {
        type: String
      }
    },
    month: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    lineItems: [
      {
        type: { type: String },
        label: { type: String },
        amount: { type: Number }
      }
    ],
    paidAt: {
      type: Date,
      required: true
    },
    transactionId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Indexes
paymentReceiptSchema.index({ paymentId: 1 }, { unique: true });
paymentReceiptSchema.index({ receiptNumber: 1 }, { unique: true });

module.exports = mongoose.model('PaymentReceipt', paymentReceiptSchema);
