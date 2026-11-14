
import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ExpenseProvider } from './src/context/ExpenseContext';

import LoginScreen from './src/screens/auth/LoginScreen';

import RegisterScreen from './src/screens/auth/RegisterScreen';

import DashboardScreen from './src/screens/DashboardScreen';

import AddExpenseScreen from './src/screens/AddExpenseScreen';

const Stack = createNativeStackNavigator();

function MainApp() {

  return (

    <NavigationContainer>

      <Stack.Navigator

        initialRouteName="Login"

        screenOptions={{

          headerShown: false,

          animation: 'slide_from_right',

          contentStyle: {
            backgroundColor: '#0B1020',
          },

        }}

      >

        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />

        <Stack.Screen
          name="Register"
          component={RegisterScreen}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />

        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
        />

      </Stack.Navigator>

    </NavigationContainer>

  );
}

export default function App() {

  return (

    <ExpenseProvider>

      <MainApp />

    </ExpenseProvider>

  );

}
