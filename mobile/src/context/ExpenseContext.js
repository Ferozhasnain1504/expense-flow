
import React, {
  createContext,
  useContext,
  useState,
} from 'react';

// 1. Create a context
const ExpenseContext = createContext();

// 2. Create the Provider
export function ExpenseProvider({ children }) {

  // Initial transactions
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      title: 'Groceries',
      category: 'Food',
      amount: 850,
      date: 'Today',
    },
    {
      id: '2',
      title: 'Uber Ride',
      category: 'Transport',
      amount: 250,
      date: 'Today',
    },
  ]);

  // Add a new expense
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    };

    setTransactions((previous) => [
      newExpense,
      ...previous,
    ]);
  };

  // Calculate total expenses
  const totalExpenses = transactions.reduce(
    (total, item) => total + item.amount,
    0
  );

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
        addExpense,
        totalExpenses,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

// 3. Custom hook
export function useExpenses() {
  return useContext(ExpenseContext);
}
