
import API from './api';

// Get all recurring expenses
export const fetchRecurringExpenses = async () => {
  const response = await API.get('/recurring-expenses');
  return response.data.recurringExpenses;
};

// Create recurring expense
export const createRecurringExpense = async (expenseData) => {
  const response = await API.post(
    '/recurring-expenses',
    expenseData
  );

  return response.data.recurringExpense;
};

// Update recurring expense
export const updateRecurringExpense = async (id, expenseData) => {
  const response = await API.put(
    `/recurring-expenses/${id}`,
    expenseData
  );

  return response.data.recurringExpense;
};

// Delete recurring expense
export const deleteRecurringExpense = async (id) => {
  const response = await API.delete(
    `/recurring-expenses/${id}`
  );

  return response.data;
};
