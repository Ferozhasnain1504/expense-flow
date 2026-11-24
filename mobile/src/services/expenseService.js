
import API from './api';

// GET ALL EXPENSES
// GET ALL EXPENSES
export const fetchExpenses = async () => {
  const response = await API.get('/expenses');

  console.log('EXPENSES API RESPONSE:', response.data);

  if (!Array.isArray(response.data?.expenses)) {
    throw new Error(
      'Invalid expenses response: expected an expenses array'
    );
  }

  return response.data.expenses;
};
// ADD EXPENSE
export const createExpense = async (expenseData) => {
  const response = await API.post('/expenses', expenseData);
  return response.data.expense;
};

// UPDATE EXPENSE
export const updateExpense = async (id, expenseData) => {
  const response = await API.put(`/expenses/${id}`, expenseData);
  return response.data.expense;
};

// DELETE EXPENSE
export const deleteExpense = async (id) => {
  const response = await API.delete(`/expenses/${id}`);
  return response.data;
};
