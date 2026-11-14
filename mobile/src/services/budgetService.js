
import API from './api';

// CREATE OR UPDATE MONTHLY BUDGET
export const saveBudget = async (budgetData) => {
  const response = await API.post('/budgets', budgetData);
  return response.data.budget;
};

// GET MONTHLY BUDGET WITH SPENDING SUMMARY
export const fetchMonthlyBudget = async (month, year) => {
  const response = await API.get('/budgets', {
    params: { month, year },
  });

  return response.data.budget;
};
