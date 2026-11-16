
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  Alert,
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

import {
  requestNotificationPermissions,
  scheduleBillReminder,
} from './src/services/notificationService';

const Stack = createNativeStackNavigator();

function MainApp() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [testingNotification, setTestingNotification] = useState(false);

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

        await getCurrentUser();

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

  const handleTestNotification = async () => {
    try {
      setTestingNotification(true);

      const permissionGranted =
        await requestNotificationPermissions();

      if (!permissionGranted) {
        Alert.alert(
          'Permission required',
          'Please allow notifications in your Android settings to test reminders.'
        );
        return;
      }

      const reminderDate = new Date(Date.now() + 5000);

      await scheduleBillReminder({
        title: 'ExpenseFlow Test',
        body: 'Your local notifications are working successfully!',
        date: reminderDate,
        data: {
          type: 'test',
        },
      });

      Alert.alert(
        'Notification scheduled',
        'You should receive a notification in approximately 5 seconds.'
      );
    } catch (error) {
      console.error('Notification test error:', error);

      Alert.alert(
        'Notification error',
        error.message || 'Could not schedule notification.'
      );
    } finally {
      setTestingNotification(false);
    }
  };

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
    <View style={styles.appContainer}>
      {initialRoute === 'MainTabs' && (
        <Pressable
          style={[
            styles.testButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleTestNotification}
          disabled={testingNotification}
        >
          <Text style={styles.testButtonText}>
            {testingNotification
              ? 'Scheduling notification...'
              : 'Test Local Notification'}
          </Text>
        </Pressable>
      )}

      <View style={styles.navigationContainer}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },

  navigationContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 14,
  },

  testButton: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
