
const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
    },

    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },

    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    nextDueDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastProcessedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Find active recurring expenses due for processing.
recurringExpenseSchema.index({
  isActive: 1,
  nextDueDate: 1,
});

// Find recurring expenses belonging to a user.
recurringExpenseSchema.index({
  user: 1,
  isActive: 1,
});

const RecurringExpense = mongoose.model(
  'RecurringExpense',
  recurringExpenseSchema
);

module.exports = RecurringExpense;
