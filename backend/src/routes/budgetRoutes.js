
const express = require('express');

const {
  createOrUpdateBudget,
  getMonthlyBudget,
} = require('../controllers/budgetController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All budget routes require authentication
router.use(protect);

// POST /api/budgets - Create or update monthly budget
router.post('/', createOrUpdateBudget);

// GET /api/budgets?month=11&year=2026 - Get monthly budget
router.get('/', getMonthlyBudget);

module.exports = router;
