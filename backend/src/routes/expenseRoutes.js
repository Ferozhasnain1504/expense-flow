
const express = require('express');

const {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All expense routes require authentication
router.use(protect);

// POST /api/expenses - Create expense
router.post('/', createExpense);

// GET /api/expenses - Get all expenses
router.get('/', getExpenses);

// PUT /api/expenses/:id - Update expense
router.put('/:id', updateExpense);

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', deleteExpense);

module.exports = router;
