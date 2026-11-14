
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// CREATE OR UPDATE MONTHLY BUDGET
const createOrUpdateBudget = async (req, res) => {
  try {
    const { month, year, totalLimit, categoryBudgets } = req.body;

    if (
      !Number.isInteger(Number(month)) ||
      Number(month) < 1 ||
      Number(month) > 12 ||
      !Number.isInteger(Number(year)) ||
      Number(year) < 2020
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid month and year',
      });
    }

    if (
      totalLimit === undefined ||
      !Number.isFinite(Number(totalLimit)) ||
      Number(totalLimit) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid monthly budget limit',
      });
    }

    if (categoryBudgets !== undefined) {
      if (!Array.isArray(categoryBudgets)) {
        return res.status(400).json({
          success: false,
          message: 'Category budgets must be an array',
        });
      }

      const invalidCategory = categoryBudgets.some(
        (item) =>
          !item.category ||
          !Number.isFinite(Number(item.limit)) ||
          Number(item.limit) < 0
      );

      if (invalidCategory) {
        return res.status(400).json({
          success: false,
          message: 'Please provide valid category budgets',
        });
      }
    }

    const updateData = {
      totalLimit: Number(totalLimit),
    };

    // Only update categories when the request includes them.
    // This preserves existing categories if the field is omitted.
    if (categoryBudgets !== undefined) {
      updateData.categoryBudgets = categoryBudgets.map((item) => ({
        category: item.category.trim(),
        limit: Number(item.limit),
      }));
    }

    const budget = await Budget.findOneAndUpdate(
      {
        user: req.user._id,
        month: Number(month),
        year: Number(year),
      },
      {
        $set: updateData,
        $setOnInsert: {
          user: req.user._id,
          month: Number(month),
          year: Number(year),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Monthly budget saved successfully',
      budget,
    });
  } catch (error) {
    console.error('Save budget error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while saving budget',
    });
  }
};

// GET MONTHLY BUDGET WITH SPENDING SUMMARY
const getMonthlyBudget = async (req, res) => {
  try {
    const month = Number(req.query.month);
    const year = Number(req.query.year);

    if (
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12 ||
      !Number.isInteger(year) ||
      year < 2020
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid month and year',
      });
    }

    const budget = await Budget.findOne({
      user: req.user._id,
      month,
      year,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'No budget found for this month',
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const spending = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpent = spending.reduce(
      (total, item) => total + item.spent,
      0
    );

    const categorySummary = budget.categoryBudgets.map((item) => {
      const categorySpending = spending.find(
        (expense) =>
          expense._id.toLowerCase() === item.category.toLowerCase()
      );

      const spent = categorySpending
        ? categorySpending.spent
        : 0;

      return {
        category: item.category,
        limit: item.limit,
        spent,
        remaining: item.limit - spent,
        percentageUsed:
          item.limit > 0 ? (spent / item.limit) * 100 : 0,
      };
    });

    return res.status(200).json({
      success: true,
      budget: {
        ...budget.toObject(),
        totalSpent,
        remaining: budget.totalLimit - totalSpent,
        percentageUsed:
          (totalSpent / budget.totalLimit) * 100,
        categorySummary,
      },
    });
  } catch (error) {
    console.error('Get monthly budget error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching monthly budget',
    });
  }
};

module.exports = {
  createOrUpdateBudget,
  getMonthlyBudget,
};
