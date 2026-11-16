
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const recurringExpenseRoutes = require('./routes/recurringExpenseRoutes');
const financialInsightsRoutes = require('./routes/financialInsightsRoutes');
const { startRecurringExpenseJob } = require('./jobs/recurringExpenseJob');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ExpenseFlow API is running!',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Healthy',
    message: 'Backend server is working correctly.',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring-expenses', recurringExpenseRoutes);
app.use('/api/financial-insights', financialInsightsRoutes);

// Connect to database and start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Start the recurring expense scheduler after DB connection.
    startRecurringExpenseJob();

    app.listen(PORT, () => {
      console.log(`ExpenseFlow server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
