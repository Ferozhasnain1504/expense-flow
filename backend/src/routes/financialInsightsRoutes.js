
const express = require('express');

const {
  getFinancialInsights,
} = require('../controllers/financialInsightsController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All financial insights routes require authentication.
router.use(protect);

// GET /api/financial-insights
router.get('/', getFinancialInsights);

module.exports = router;
