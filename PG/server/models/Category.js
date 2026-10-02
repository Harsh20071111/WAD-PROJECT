const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    pgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PG',
      required: [true, 'PG ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
categorySchema.index({ pgId: 1 });
categorySchema.index({ pgId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
