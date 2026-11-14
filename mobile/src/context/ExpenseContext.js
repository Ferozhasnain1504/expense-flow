
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

import {
  fetchExpenses as fetchExpensesAPI,
  createExpense as createExpenseAPI,
  updateExpense as updateExpenseAPI,
  deleteExpense as deleteExpenseAPI,
} from '../services/expenseService';

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Convert MongoDB expense into the format used by the mobile app
  const formatExpense = (expense) => ({
    ...expense,
    id: expense._id,
    date: expense.date,
    amount: Number(expense.amount),
  });

  // GET EXPENSES FROM BACKEND
  const refreshExpenses = useCallback(async () => {
    try {
      setLoading(true);

      const expenses = await fetchExpensesAPI();

      const formattedExpenses = expenses.map(formatExpense);

      setTransactions(formattedExpenses);

      return formattedExpenses;
    } catch (error) {
      console.log(
        'Fetch expenses error:',
        error.response?.data || error.message
      );

      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // ADD A NEW EXPENSE
  const addExpense = async (expense) => {
    try {
      const newExpense = await createExpenseAPI(expense);

      const formattedExpense = formatExpense(newExpense);

      setTransactions((previous) => [
        formattedExpense,
        ...previous,
      ]);

      return formattedExpense;
    } catch (error) {
      console.log(
        'Add expense error:',
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // UPDATE AN EXISTING EXPENSE
  const updateExpense = async (id, updatedExpense) => {
    try {
      const updatedItem = await updateExpenseAPI(id, updatedExpense);

      const formattedExpense = formatExpense(updatedItem);

      setTransactions((previous) =>
        previous.map((item) =>
          item.id === id ? formattedExpense : item
        )
      );

      return formattedExpense;
    } catch (error) {
      console.log(
        'Update expense error:',
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // DELETE AN EXPENSE
  const deleteExpense = async (id) => {
    try {
      await deleteExpenseAPI(id);

      setTransactions((previous) =>
        previous.filter((item) => item.id !== id)
      );
    } catch (error) {
      console.log(
        'Delete expense error:',
        error.response?.data || error.message
      );

      throw error;
    }
  };

  // CALCULATE TOTAL EXPENSES
  const totalExpenses = transactions.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        loading,
        refreshExpenses,
        addExpense,
        updateExpense,
        deleteExpense,
        totalExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpenseContext);
}
