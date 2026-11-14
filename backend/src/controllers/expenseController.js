
const Expense = require('../models/Expense');

// CREATE EXPENSE
const createExpense = async (req, res) => {
  try {
    const { title, category, amount, date, notes } = req.body;

    if (!title || !category || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, category and amount',
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount',
      });
    }

    const expense = await Expense.create({
      user: req.user._id,
      title,
      category,
      amount: Number(amount),
      date: date || Date.now(),
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense,
    });
  } catch (error) {
    console.error('Create expense error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while creating expense',
    });
  }
};

// GET ALL EXPENSES FOR LOGGED-IN USER
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      user: req.user._id,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error('Get expenses error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses',
    });
  }
};

// UPDATE EXPENSE
const updateExpense = async (req, res) => {
  try {
    const { title, category, amount, date, notes } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (amount !== undefined) {
      if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid amount',
        });
      }

      updates.amount = Number(amount);
    }
    if (date !== undefined) updates.date = date;
    if (notes !== undefined) updates.notes = notes;

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense,
    });
  } catch (error) {
    console.error('Update expense error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while updating expense',
    });
  }
};

// DELETE EXPENSE
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    console.error('Delete expense error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid expense ID',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while deleting expense',
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};
