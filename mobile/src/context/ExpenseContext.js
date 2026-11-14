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

  // Add a new expense
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
    };

    setTransactions((previous) => [newExpense, ...previous]);
  };

  // Update an existing expense
  const updateExpense = (id, updatedExpense) => {
    setTransactions((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, ...updatedExpense }
          : item
      )
    );
  };

  // Delete an expense
  const deleteExpense = (id) => {
    setTransactions((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  // Calculate total expenses
  const totalExpenses = transactions.reduce(
    (total, item) => total + Number(item.amount),
    0
  );

  return (
    <ExpenseContext.Provider
      value={{
        transactions,
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