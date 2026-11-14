
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
