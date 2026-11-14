
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
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
      min: [0, 'Amount cannot be negative'],
    },

    date: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      trim: true,
      default: '',
    },

    // Links a generated expense to its recurring schedule.
    recurringExpense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringExpense',
      default: null,
    },

    // Identifies one particular occurrence of a recurring expense.
    recurringOccurrenceKey: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Existing expense lookup index.
expenseSchema.index({ user: 1, date: -1 });

// Prevent duplicate generation of the same recurring occurrence.
expenseSchema.index(
  {
    recurringExpense: 1,
    recurringOccurrenceKey: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      recurringExpense: { $type: 'objectId' },
      recurringOccurrenceKey: { $type: 'string' },
    },
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
