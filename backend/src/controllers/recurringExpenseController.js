
const RecurringExpense = require('../models/RecurringExpense');

const {
  processDueRecurringExpenses,
} = require('../jobs/recurringExpenseJob');

// CREATE RECURRING EXPENSE
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

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
    }

    const allowedFrequencies = [
      'daily',
      'weekly',
      'monthly',
      'yearly',
    ];

    if (!allowedFrequencies.includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recurrence frequency',
      });
    }

    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid start date',
      });
    }

    let parsedEndDate = null;

    if (endDate) {
      parsedEndDate = new Date(endDate);

      if (
        Number.isNaN(parsedEndDate.getTime()) ||
        parsedEndDate < parsedStartDate
      ) {
        return res.status(400).json({
          success: false,
          message: 'End date must be valid and on or after the start date',
        });
      }
    }

    const recurringExpense = await RecurringExpense.create({
      user: req.user._id,
      title: title.trim(),
      category: category.trim(),
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

// GET ALL RECURRING EXPENSES
const getRecurringExpenses = async (req, res) => {
  try {
    const recurringExpenses = await RecurringExpense.find({
      user: req.user._id,
    }).sort({ nextDueDate: 1 });

    return res.status(200).json({
      success: true,
      count: recurringExpenses.length,
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

// UPDATE RECURRING EXPENSE
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

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        recurringExpense[field] = req.body[field];
      }
    }

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

// DELETE RECURRING EXPENSE
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

// MANUALLY RUN RECURRING EXPENSE JOB (DEVELOPMENT ONLY)
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
      message: 'Failed to execute recurring expense job',
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
