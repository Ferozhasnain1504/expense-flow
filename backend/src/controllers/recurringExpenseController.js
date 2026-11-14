
const RecurringExpense = require('../models/RecurringExpense');
const { processDueRecurringExpenses } = require('../jobs/recurringExpenseJob');

// Calculate the next occurrence.
const calculateNextDueDate = (date, frequency) => {
  const nextDate = new Date(date);

  if (frequency === 'daily') {
    nextDate.setDate(nextDate.getDate() + 1);
  } else if (frequency === 'weekly') {
    nextDate.setDate(nextDate.getDate() + 7);
  } else if (frequency === 'monthly') {
    const originalDay = nextDate.getDate();
    const targetMonth = nextDate.getMonth() + 1;

    nextDate.setDate(1);
    nextDate.setMonth(targetMonth);

    const lastDay = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth() + 1,
      0
    ).getDate();

    nextDate.setDate(Math.min(originalDay, lastDay));
  } else if (frequency === 'yearly') {
    const originalMonth = nextDate.getMonth();

    nextDate.setFullYear(nextDate.getFullYear() + 1);

    if (nextDate.getMonth() !== originalMonth) {
      nextDate.setDate(0);
    }
  }

  return nextDate;
};

// CREATE recurring expense
const createRecurringExpense = async (req, res) => {
  try {
    const {
      title,
      category,
      amount,
      frequency,
      startDate,
      endDate,
      notes,
    } = req.body;

    if (!title || !category || !frequency || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (
      !['daily', 'weekly', 'monthly', 'yearly'].includes(frequency)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurrence frequency',
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = endDate ? new Date(endDate) : null;

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date',
      });
    }

    if (
      parsedEndDate &&
      (Number.isNaN(parsedEndDate.getTime()) ||
        parsedEndDate < parsedStartDate)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid end date',
      });
    }

    const recurringExpense = await RecurringExpense.create({
      user: req.user._id,
      title,
      category,
      amount: Number(amount),
      frequency,
      startDate: parsedStartDate,
      nextDueDate: parsedStartDate,
      endDate: parsedEndDate,
      notes: notes || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Recurring expense created successfully',
      recurringExpense,
    });
  } catch (error) {
    console.error('Create recurring expense error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while creating recurring expense',
    });
  }
};

// GET all recurring expenses
const getRecurringExpenses = async (req, res) => {
  try {
    const recurringExpenses = await RecurringExpense.find({
      user: req.user._id,
    }).sort({ nextDueDate: 1 });

    return res.status(200).json({
      success: true,
      recurringExpenses,
    });
  } catch (error) {
    console.error('Get recurring expenses error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching recurring expenses',
    });
  }
};

// UPDATE recurring expense
const updateRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recurringExpense) {
      return res.status(404).json({
        success: false,
        message: 'Recurring expense not found',
      });
    }

    const allowedFields = [
      'title',
      'category',
      'amount',
      'frequency',
      'startDate',
      'endDate',
      'notes',
      'isActive',
    ];

    if (
      req.body.amount !== undefined &&
      (!Number.isFinite(Number(req.body.amount)) ||
        Number(req.body.amount) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
    }

    if (
      req.body.frequency !== undefined &&
      !['daily', 'weekly', 'monthly', 'yearly'].includes(
        req.body.frequency
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurrence frequency',
      });
    }

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        recurringExpense[field] = req.body[field];
      }
    }

    if (
      req.body.frequency !== undefined ||
      req.body.startDate !== undefined
    ) {
      const startDate = new Date(recurringExpense.startDate);

      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid start date',
        });
      }

      recurringExpense.nextDueDate = calculateNextDueDate(
        startDate,
        recurringExpense.frequency
      );

      recurringExpense.lastProcessedDate = null;
    }

    if (
      recurringExpense.endDate &&
      new Date(recurringExpense.endDate) < new Date(recurringExpense.startDate)
    ) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date',
      });
    }

    await recurringExpense.save();

    return res.status(200).json({
      success: true,
      message: 'Recurring expense updated successfully',
      recurringExpense,
    });
  } catch (error) {
    console.error('Update recurring expense error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while updating recurring expense',
    });
  }
};

// DELETE recurring expense
const deleteRecurringExpense = async (req, res) => {
  try {
    const recurringExpense = await RecurringExpense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recurringExpense) {
      return res.status(404).json({
        success: false,
        message: 'Recurring expense not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Recurring expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete recurring expense error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while deleting recurring expense',
    });
  }
};

// MANUAL scheduler trigger (development/testing)
const runRecurringExpenseJob = async (req, res) => {
  try {
    await processDueRecurringExpenses();

    return res.status(200).json({
      success: true,
      message: 'Recurring expense job executed successfully',
    });
  } catch (error) {
    console.error('Manual recurring job error:', error);

    return res.status(500).json({
      success: false,
      message: 'Recurring expense job failed',
    });
  }
};

module.exports = {
  createRecurringExpense,
  getRecurringExpenses,
  updateRecurringExpense,
  deleteRecurringExpense,
  runRecurringExpenseJob,
};
