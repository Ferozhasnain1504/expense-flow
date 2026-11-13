
import React, { createContext, useContext, useState } from 'react';

const ExpenseContext = createContext();

export function ExpenseProvider({ children }) {
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

export function useExpenses() {
  return useContext(ExpenseContext);
}
