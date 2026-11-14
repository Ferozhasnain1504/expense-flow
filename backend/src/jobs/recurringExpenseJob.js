
const cron = require('node-cron');
const mongoose = require('mongoose');

const RecurringExpense = require('../models/RecurringExpense');
const Expense = require('../models/Expense');

// Calculate the next occurrence without losing month-end dates.
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
    const originalDay = nextDate.getDate();

    nextDate.setFullYear(nextDate.getFullYear() + 1);

    // Handle leap-day dates.
    if (nextDate.getMonth() !== originalMonth) {
      nextDate.setDate(0);
    } else {
      nextDate.setDate(originalDay);
    }
  }

  return nextDate;
};

// Generate all transactions currently due for one schedule.
const processRecurringExpense = async (recurringExpense) => {
  let dueDate = new Date(recurringExpense.nextDueDate);
  const now = new Date();

  while (dueDate <= now) {
    if (
      recurringExpense.endDate &&
      dueDate > recurringExpense.endDate
    ) {
      recurringExpense.isActive = false;
      break;
    }

    const occurrenceKey = dueDate.toISOString();

    try {
      await Expense.create({
        user: recurringExpense.user,
        title: recurringExpense.title,
        category: recurringExpense.category,
        amount: recurringExpense.amount,
        date: dueDate,
        notes: recurringExpense.notes,
        recurringExpense: recurringExpense._id,
        recurringOccurrenceKey: occurrenceKey,
      });
    } catch (error) {
      // A duplicate means this occurrence was already generated.
      if (error.code !== 11000) {
        throw error;
      }
    }

    recurringExpense.lastProcessedDate = dueDate;

    dueDate = calculateNextDueDate(
      dueDate,
      recurringExpense.frequency
    );
  }

  recurringExpense.nextDueDate = dueDate;

  if (
    recurringExpense.endDate &&
    dueDate > recurringExpense.endDate
  ) {
    recurringExpense.isActive = false;
  }

  await recurringExpense.save();
};

// Process all active schedules.
const processDueRecurringExpenses = async () => {
  try {
    const now = new Date();

    const dueExpenses = await RecurringExpense.find({
      isActive: true,
      nextDueDate: { $lte: now },
    });

    for (const recurringExpense of dueExpenses) {
      try {
        await processRecurringExpense(recurringExpense);
      } catch (error) {
        console.error(
          `Failed to process recurring expense ${recurringExpense._id}:`,
          error.message
        );
      }
    }

    console.log(
      `Recurring expense job completed. Checked ${dueExpenses.length} schedules.`
    );
  } catch (error) {
    console.error('Recurring expense job error:', error);
  }
};

// Run once daily at midnight.
const startRecurringExpenseJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running recurring expense job...');
      await processDueRecurringExpenses();
      console.log('Recurring expense job completed.');
    } catch (error) {
      console.error('Recurring expense job failed:', error);
    }
  });

  console.log('Recurring expense scheduler started.');
};

module.exports = {
  startRecurringExpenseJob,
  processDueRecurringExpenses,
};
