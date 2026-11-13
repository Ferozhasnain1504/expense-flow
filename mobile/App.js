
import React, { useState } from 'react';

import { View } from 'react-native';

import { ExpenseProvider } from './src/context/ExpenseContext';

import DashboardScreen from './src/screens/DashboardScreen';

import AddExpenseScreen from './src/screens/AddExpenseScreen';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  return (
    <View style={{ flex: 1 }}>
      {currentScreen === 'dashboard' ? (
        <DashboardScreen
          onAddExpense={() => setCurrentScreen('add')}
        />
      ) : (
        <AddExpenseScreen
          onBack={() => setCurrentScreen('dashboard')}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <MainApp />
    </ExpenseProvider>
  );
}
