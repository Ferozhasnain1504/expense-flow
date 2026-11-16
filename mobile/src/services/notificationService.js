
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


const REMINDER_STORAGE_KEY = 'expenseflow_recurring_reminders';

// Configure how notifications appear while the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Request notification permissions.
export const requestNotificationPermissions = async () => {
  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } =
      await Notifications.requestPermissionsAsync();

    finalStatus = status;
  }

  return finalStatus === 'granted';
};

// Schedule a local bill reminder.
export const scheduleBillReminder = async ({
  title,
  body,
  date,
  data = {},
}) => {
  const reminderDate = new Date(date);

  if (Number.isNaN(reminderDate.getTime())) {
    throw new Error('Invalid reminder date');
  }

  if (reminderDate.getTime() <= Date.now()) {
    throw new Error('Reminder date must be in the future');
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
};

// Cancel a scheduled reminder.
export const cancelBillReminder = async (notificationId) => {
  if (!notificationId) return;

  await Notifications.cancelScheduledNotificationAsync(
    notificationId
  );
};

// Get all scheduled reminders.
export const getScheduledBillReminders = async () => {
  return Notifications.getAllScheduledNotificationsAsync();
};

export const scheduleRecurringExpenseReminder = async (expense) => {
  // Cancel any previously scheduled reminder for this expense.
  await cancelRecurringExpenseReminder(expense._id);

  const dueDate = new Date(expense.nextDueDate);

  // One day before payment, at 9 AM.
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 1);
  reminderDate.setHours(9, 0, 0, 0);

  // Skip past reminder dates.
  if (reminderDate.getTime() <= Date.now()) {
    return null;
  }

  const notificationId = await scheduleBillReminder({
    title: `Upcoming payment: ${expense.title}`,
    body: `Your payment of ₹${expense.amount} is due tomorrow.`,
    date: reminderDate,
    data: {
      type: 'recurring-expense',
      recurringExpenseId: expense._id,
    },
  });

  // Save the notification ID against the recurring expense ID.
  const storedReminders = await AsyncStorage.getItem(
    REMINDER_STORAGE_KEY
  );

  const reminders = storedReminders
    ? JSON.parse(storedReminders)
    : {};

  reminders[expense._id] = notificationId;

  await AsyncStorage.setItem(
    REMINDER_STORAGE_KEY,
    JSON.stringify(reminders)
  );

  return notificationId;
};

// Cancel the reminder belonging to a recurring expense.
export const cancelRecurringExpenseReminder = async (expenseId) => {
  const storedReminders = await AsyncStorage.getItem(
    REMINDER_STORAGE_KEY
  );

  const reminders = storedReminders
    ? JSON.parse(storedReminders)
    : {};

  const notificationId = reminders[expenseId];

  if (notificationId) {
    await cancelBillReminder(notificationId);
    delete reminders[expenseId];

    await AsyncStorage.setItem(
      REMINDER_STORAGE_KEY,
      JSON.stringify(reminders)
    );
  }
};