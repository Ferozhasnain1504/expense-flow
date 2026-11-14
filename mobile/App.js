
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ExpenseProvider, useExpenses } from './src/context/ExpenseContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import EditExpenseScreen from './src/screens/EditExpenseScreen';
import MainTabs from './src/navigation/MainTabs';

import {
  getToken,
  getCurrentUser,
  logoutUser,
} from './src/services/authService';

const Stack = createNativeStackNavigator();

function MainApp() {
  const [initialRoute, setInitialRoute] = useState(null);

  const { refreshExpenses } = useExpenses();
  const { theme } = useTheme();
  const colors = theme.colors;

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await getToken();

        if (!token) {
          setInitialRoute('Login');
          return;
        }

        // Verify the saved token with the backend
        await getCurrentUser();

        // Load the user's expenses
        try {
          await refreshExpenses();
        } catch (expenseError) {
          console.log(
            'Could not load expenses:',
            expenseError.message
          );
        }

        setInitialRoute('MainTabs');
      } catch (error) {
        console.log(
          'Authentication check failed:',
          error.response?.data || error.message
        );

        // Remove expired or invalid tokens
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          await logoutUser();
        }

        setInitialRoute('Login');
      }
    };

    checkAuthentication();
  }, [refreshExpenses]);

  // Show loading screen while checking authentication
  if (!initialRoute) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={[
            styles.loadingText,
            { color: colors.secondaryText },
          ]}
        >
          Checking your account...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 14,
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <ExpenseProvider>
        <MainApp />
      </ExpenseProvider>
    </ThemeProvider>
  );
}
