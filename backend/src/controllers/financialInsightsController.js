
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const getMonthRange = (year, month) => ({
  start: new Date(year, month - 1, 1),
  end: new Date(year, month, 1),
});

const getCategoryTotals = (expenses) => {
  const totals = {};

  expenses.forEach((expense) => {
    const category = expense.category.trim();
    const key = category.toLowerCase();

    if (!totals[key]) {
      totals[key] = {
        category,
        amount: 0,
        count: 0,
      };
    }

    totals[key].amount += expense.amount;
    totals[key].count += 1;
  });

  return totals;
};

const calculateAverage = (values) => {
  if (!values.length) return 0;

  return values.reduce((sum, value) => sum + value, 0) /
    values.length;
};

const getFinancialInsights = async (req, res) => {
  try {
    const now = new Date();

    const month = req.query.month
      ? Number(req.query.month)
      : now.getMonth() + 1;

    const year = req.query.year
      ? Number(req.query.year)
      : now.getFullYear();

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

    const { start, end } = getMonthRange(year, month);

    // Fetch current month expenses and previous 3 months.
    const historyStart = new Date(year, month - 4, 1);

    const [expenses, budget] = await Promise.all([
      Expense.find({
        user: req.user._id,
        date: {
          $gte: historyStart,
          $lt: end,
        },
      }).sort({ date: 1 }),

      Budget.findOne({
        user: req.user._id,
        month,
        year,
      }),
    ]);

    const currentExpenses = expenses.filter(
      (expense) =>
        expense.date >= start && expense.date < end
    );

    const previousExpenses = expenses.filter(
      (expense) => expense.date < start
    );

    const currentTotal = currentExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const currentCategories = getCategoryTotals(currentExpenses);
    const previousCategories = getCategoryTotals(previousExpenses);

    // Calculate average daily spending for the previous 3 months.
    const previousMonthTotals = [];

    for (let offset = 1; offset <= 3; offset++) {
      const previousStart = new Date(year, month - 1 - offset, 1);
      const previousEnd = new Date(year, month - offset, 1);

      const monthlyTotal = previousExpenses
        .filter(
          (expense) =>
            expense.date >= previousStart &&
            expense.date < previousEnd
        )
        .reduce((sum, expense) => sum + expense.amount, 0);

      previousMonthTotals.push(monthlyTotal);
    }

    const averagePreviousMonthlySpending =
      calculateAverage(previousMonthTotals);

   const selectedMonthEnd = new Date(year, month, 0);
const isCurrentMonth =
  month === now.getMonth() + 1 &&
  year === now.getFullYear();

const currentMonthDays = isCurrentMonth
  ? now.getDate()
  : selectedMonthEnd.getDate();

    const previousDailyAverage =
  previousExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  ) /
  Math.max(
    1,
    Math.round(
      (start.getTime() - historyStart.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );
    const currentDailyAverage = currentTotal / currentMonthDays;

    const spendingChangePercentage =
      previousDailyAverage > 0
        ? ((currentDailyAverage - previousDailyAverage) /
            previousDailyAverage) *
          100
        : null;

    // 1. Spending trends.
    
    // 1. Spending trends.
    // Compare daily spending rates to avoid comparing
    // an incomplete month against three complete months.

    const previousHistoryDays = Math.max(
      1,
      Math.round(
        (start.getTime() - historyStart.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    const spendingTrends = Object.values(currentCategories).map(
      (item) => {
        const previous = previousCategories[
          item.category.toLowerCase()
        ];

        const previousAmount = previous
          ? previous.amount
          : 0;

        const previousDailyAverage =
          previousAmount / previousHistoryDays;

        const currentDailyAverage =
          item.amount / currentMonthDays;

        const changePercentage =
          previousDailyAverage > 0
            ? ((currentDailyAverage - previousDailyAverage) /
                previousDailyAverage) *
              100
            : null;

        return {
          category: item.category,

          currentSpending: Number(item.amount.toFixed(2)),

          previousThreeMonthAverage: Number(
            (previousAmount / 3).toFixed(2)
          ),

          currentDailyAverage: Number(
            currentDailyAverage.toFixed(2)
          ),

          previousDailyAverage: Number(
            previousDailyAverage.toFixed(2)
          ),

          changePercentage:
            changePercentage === null
              ? null
              : Number(changePercentage.toFixed(1)),

          trend:
            changePercentage === null
              ? 'insufficient_history'
              : changePercentage > 10
                ? 'increased'
                : changePercentage < -10
                  ? 'decreased'
                  : 'stable',
        };
      }
    );



// 2. Detect unusually large individual expenses.
const unusualExpenses = [];

const historicalCategoryAmounts = {};

previousExpenses.forEach((expense) => {
  const key = expense.category.toLowerCase();

  if (!historicalCategoryAmounts[key]) {
    historicalCategoryAmounts[key] = [];
  }

  historicalCategoryAmounts[key].push(expense.amount);
});

// Calculate median to reduce the effect of historical outliers.
const calculateMedian = (values) => {
  if (!values.length) return 0;

  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middle - 1] + sortedValues[middle]) / 2;
  }

  return sortedValues[middle];
};

currentExpenses.forEach((expense) => {
  const history =
    historicalCategoryAmounts[expense.category.toLowerCase()] || [];

  // Require at least three historical transactions.
  if (history.length < 3) return;

  const median = calculateMedian(history);

  // Ignore categories without meaningful historical spending.
  if (median <= 0) return;

  // Flag expenses that are more than twice the historical median.
  const threshold = median * 2;

  if (expense.amount > threshold) {
    unusualExpenses.push({
      id: expense._id,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      historicalAverage: Number(median.toFixed(2)),
      message:
        'This expense is more than twice your typical spending in this category.',
    });
  }
});


   
// 3. Budget recommendations and budget health.
const budgetRecommendations = [];
const categoryBudgetSummary = [];

let totalBudgetSpent = 0;
let categoriesWithinBudget = 0;

if (budget) {
  totalBudgetSpent = currentTotal;

  const categoryLimits = budget.categoryBudgets || [];

  categoryLimits.forEach((item) => {
    const actual = currentCategories[
      item.category.toLowerCase()
    ];

    const spent = actual ? actual.amount : 0;

    const percentageUsed =
      item.limit > 0
        ? (spent / item.limit) * 100
        : spent > 0
          ? 100
          : 0;

    const remaining = item.limit - spent;

    if (spent <= item.limit) {
      categoriesWithinBudget++;
    }

    let status = 'within_budget';

    if (percentageUsed >= 100) {
      status = 'over_budget';
    } else if (percentageUsed >= 80) {
      status = 'near_limit';
    }

    categoryBudgetSummary.push({
      category: item.category,
      limit: item.limit,
      spent: Number(spent.toFixed(2)),
      remaining: Number(remaining.toFixed(2)),
      percentageUsed: Number(percentageUsed.toFixed(1)),
      status,
    });

    if (status === 'over_budget') {
      budgetRecommendations.push({
        category: item.category,
        type: 'over_budget',
        priority: 'high',
        message: `You have exceeded your ${item.category} budget by ₹${Math.abs(remaining).toFixed(2)}. Review upcoming expenses in this category.`,
      });
    } else if (status === 'near_limit') {
      budgetRecommendations.push({
        category: item.category,
        type: 'approaching_limit',
        priority: 'medium',
        message: `You have used ${percentageUsed.toFixed(0)}% of your ${item.category} budget. Consider limiting further spending.`,
      });
    } else if (percentageUsed >= 50) {
      budgetRecommendations.push({
        category: item.category,
        type: 'budget_progress',
        priority: 'low',
        message: `You have used ${percentageUsed.toFixed(0)}% of your ${item.category} budget. Keep monitoring your spending.`,
      });
    }
  });
}


// 4. Identify potential savings opportunities.
const savingsOpportunities = spendingTrends
  .filter(
    (item) =>
      item.changePercentage !== null &&
      item.changePercentage > 20 &&
      item.currentSpending > 0
  )
  .map((item) => {
    const increaseAmount =
      item.currentDailyAverage - item.previousDailyAverage;

    return {
      category: item.category,
      increasePercentage: item.changePercentage,
      currentDailyAverage: Number(
        item.currentDailyAverage.toFixed(2)
      ),
      previousDailyAverage: Number(
        item.previousDailyAverage.toFixed(2)
      ),
      estimatedMonthlyIncrease: Number(
        (increaseAmount * 30).toFixed(2)
      ),
      message: `${item.category} spending is ${item.changePercentage}% higher per day than your previous three-month average. Review this category for possible savings.`,
    };
  });



    // 5. Calculate a spending health score.
    // This is a spending-management indicator, not a credit score.

    let budgetScore = null;
    let trendScore = null;
    let consistencyScore = null;

    const hasBudget = Boolean(budget);

    const hasTrendHistory =
      spendingChangePercentage !== null;

    const monthsWithHistory =
      previousMonthTotals.filter((amount) => amount > 0).length;

    const hasConsistencyHistory = monthsWithHistory >= 2;

    if (hasBudget) {
      const totalPercentageUsed =
        budget.totalLimit > 0
          ? (totalBudgetSpent / budget.totalLimit) * 100
          : totalBudgetSpent > 0
            ? 100
            : 0;

      if (totalPercentageUsed <= 70) {
        budgetScore = 100;
      } else if (totalPercentageUsed <= 85) {
        budgetScore = 85;
      } else if (totalPercentageUsed <= 100) {
        budgetScore = 65;
      } else {
        budgetScore = Math.max(
          0,
          65 - (totalPercentageUsed - 100)
        );
      }
    }

    if (hasTrendHistory) {
      trendScore =
        spendingChangePercentage <= 0
          ? 100
          : Math.max(0, 100 - spendingChangePercentage);
    }

    if (hasConsistencyHistory) {
      consistencyScore = 100;
    }

    // Calculate the score using only available components.
    const availableComponents = [];

    if (budgetScore !== null) {
      availableComponents.push({
        score: budgetScore,
        weight: 0.5,
      });
    }

    if (trendScore !== null) {
      availableComponents.push({
        score: trendScore,
        weight: 0.3,
      });
    }

    if (consistencyScore !== null) {
      availableComponents.push({
        score: consistencyScore,
        weight: 0.2,
      });
    }

    const totalAvailableWeight = availableComponents.reduce(
      (total, component) => total + component.weight,
      0
    );

    const spendingHealthScore =
      totalAvailableWeight > 0
        ? Math.round(
            availableComponents.reduce(
              (total, component) =>
                total + component.score * component.weight,
              0
            ) / totalAvailableWeight
          )
        : null;

    const spendingHealthLabel =
      spendingHealthScore === null
        ? 'Insufficient data'
        : spendingHealthScore >= 80
          ? 'Good'
          : spendingHealthScore >= 60
            ? 'Fair'
            : 'Needs attention';

    return res.status(200).json({
      success: true,
      period: {
        month,
        year,
      },
      overview: {
        totalSpent: Number(currentTotal.toFixed(2)),
        transactionCount: currentExpenses.length,
        averagePreviousMonthlySpending: Number(
          averagePreviousMonthlySpending.toFixed(2)
        ),
        currentDailyAverage: Number(
          currentDailyAverage.toFixed(2)
        ),
        spendingChangePercentage:
          spendingChangePercentage === null
            ? null
            : Number(spendingChangePercentage.toFixed(1)),
      },
      spendingTrends,
      unusualExpenses,
      budget: budget
        ? {
            totalLimit: budget.totalLimit,
            totalSpent: Number(totalBudgetSpent.toFixed(2)),
            remaining: Number(
              (budget.totalLimit - totalBudgetSpent).toFixed(2)
            ),
            percentageUsed: Number(
              ((totalBudgetSpent / budget.totalLimit) * 100).toFixed(1)
            ),
            categorySummary: categoryBudgetSummary,
          }
        : null,
      budgetRecommendations,
      savingsOpportunities,
      
      spendingHealth: {
        score: spendingHealthScore,
        label: spendingHealthLabel,
        dataAvailable: {
          budget: hasBudget,
          spendingTrends: hasTrendHistory,
          consistency: hasConsistencyHistory,
        },
        components: {
          budgetScore:
            budgetScore === null ? null : Math.round(budgetScore),
          trendScore:
            trendScore === null ? null : Math.round(trendScore),
          consistencyScore,
        },
      },
    });
  } catch (error) {
    console.error('Financial insights error:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while generating financial insights',
    });
  }
};

module.exports = {
  getFinancialInsights,
};
