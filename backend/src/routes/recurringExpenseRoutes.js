
const express = require('express');
const router = express.Router();

const {
  createRecurringExpense,
  getRecurringExpenses,
  updateRecurringExpense,
  deleteRecurringExpense,
  runRecurringExpenseJob,
} = require('../controllers/recurringExpenseController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createRecurringExpense);
router.get('/', getRecurringExpenses);

// Development-only manual scheduler trigger
router.post('/run-job', runRecurringExpenseJob);

router.put('/:id', updateRecurringExpense);
router.delete('/:id', deleteRecurringExpense);

module.exports = router;
