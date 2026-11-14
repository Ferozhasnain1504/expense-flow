
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

import {
  fetchMonthlyBudget as fetchMonthlyBudgetAPI,
  saveBudget as saveBudgetAPI,
} from '../services/budgetService';

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Budget state
  const [budget, setBudget] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetPeriod, setBudgetPeriod] = useState(null);

  // Convert MongoDB expense into mobile app format
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

  // GET MONTHLY BUDGET
  const refreshBudget = useCallback(async (month, year) => {
    try {
      setBudgetLoading(true);

      const result = await fetchMonthlyBudgetAPI(month, year);

      console.log('BUDGET API RESULT:', result);
      console.log('REQUESTED MONTH/YEAR:', month, year);

      setBudget(result);
      setBudgetPeriod({ month, year });

      return result;
    } catch (error) {
      if (error.response?.status === 404) {
        setBudget(null);
        setBudgetPeriod({ month, year });
        return null;
      }

      console.log(
        'Fetch budget error:',
        error.response?.data || error.message
      );

      throw error;
    } finally {
      setBudgetLoading(false);
    }
  }, []);


  // CREATE OR UPDATE MONTHLY BUDGET
  const saveMonthlyBudget = async (budgetData) => {
    try {
      setBudgetLoading(true);

      const savedBudget = await saveBudgetAPI(budgetData);

      await refreshBudget(budgetData.month, budgetData.year);

      return savedBudget;
    } catch (error) {
      console.log(
        'Save budget error:',
        error.response?.data || error.message
      );

      throw error;
    } finally {
      setBudgetLoading(false);
    }
  };

  // REFRESH LOADED BUDGET AFTER EXPENSE CHANGES
  const refreshLoadedBudget = async () => {
    if (budgetPeriod) {
      try {
        await refreshBudget(
          budgetPeriod.month,
          budgetPeriod.year
        );
      } catch (error) {
        console.log('Budget refresh error:', error.message);
      }
    }
  };

  // ADD A NEW EXPENSE
  const addExpense = async (expense) => {
    try {
      const newExpense = await createExpenseAPI(expense);
      const formattedExpense = formatExpense(newExpense);

      setTransactions((previous) => [
        formattedExpense,
        ...previous,
      ]);

      await refreshLoadedBudget();

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

      await refreshLoadedBudget();

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

      await refreshLoadedBudget();
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

        // Budget values and functions
        budget,
        budgetLoading,
        refreshBudget,
        saveMonthlyBudget,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpenseContext);
}
