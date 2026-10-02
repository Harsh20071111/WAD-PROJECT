const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'PG name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true
      }
    },
    contact: {
      phone: {
        type: String,
        required: [true, 'Contact phone is required'],
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    amenities: [{
      type: String,
      trim: true
    }],
    photos: [{
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
    }],
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    }
  },
  {
    timestamps: true
  }
);

// Indexes
pgSchema.index({ ownerId: 1 });

module.exports = mongoose.model('PG', pgSchema);
