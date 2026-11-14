
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
      min: 2020,
    },

    totalLimit: {
      type: Number,
      required: [true, 'Monthly budget limit is required'],
      min: [0, 'Budget cannot be negative'],
    },

    categoryBudgets: [
      {
        category: {
          type: String,
          required: true,
          trim: true,
        },

        limit: {
          type: Number,
          required: true,
          min: [0, 'Category budget cannot be negative'],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// One budget document per user per month.
budgetSchema.index(
  { user: 1, month: 1, year: 1 },
  { unique: true }
);

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
