// hooks/useNotifications.tsx

import * as Notifications from 'expo-notifications';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
} from 'react';
import { Platform } from 'react-native';

// --- Interfaces ---
export interface ScheduleWeeklyReminderOptions {
  content: Notifications.NotificationContentInput;
  time: {
    hour: number;
    minute: number;
  };
  weekdays: number[];
}

interface NotificationContextType {
  scheduleNotificationAsync: (
    request: Notifications.NotificationRequestInput
  ) => Promise<string>;
  scheduleWeeklyReminder: (
    options: ScheduleWeeklyReminderOptions
  ) => Promise<string[]>;
  cancelNotificationByIdAsync: (notificationId: string) => Promise<void>;
  getScheduledNotificationsAsync: () => Promise<Notifications.Notification[]>;
  cancelAllNotificationsAsync: () => Promise<void>;
}
// ---

const NotificationsContext = createContext<NotificationContextType | undefined>(
  undefined
);

const NotificationsProvider: FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    const configureNotificationsAsync = async () => {
      const { granted } = await Notifications.requestPermissionsAsync();
      if (!granted) {
        console.warn('⚠️ Notification Permissions not granted!');
        return;
      }

      // 1. REVERT: Set the handler ONCE and leave it.
      // This fixes the "iOS not delivering" bug.
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // 2. Android Channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    };

    configureNotificationsAsync();
  }, []);

  /**
   * Schedules a generic notification.
   * REVERT: We are removing the toggle logic.
   */
  const scheduleNotificationAsync = async (
    request: Notifications.NotificationRequestInput
  ) => {
    const id = await Notifications.scheduleNotificationAsync(request);
    console.log('✍️ Scheduling generic notification: ', id);
    return id;
  };

  /**
   * Schedules recurring weekly reminders.
   *
   * NEW STRATEGY: This now calculates the next 8 trigger dates and
   * schedules 8 individual, one-time notifications.
   * This bypasses the OS-level "repeats: true" bug.
   */
  const scheduleWeeklyReminder = async (
    options: ScheduleWeeklyReminderOptions
  ) => {
    const { content, time, weekdays } = options;
    const notificationIds: string[] = [];
    
    const now = new Date();
    const datesToSchedule: Date[] = [];
    const WEEKS_TO_SCHEDULE = 8; // Schedule for the next 8 weeks

    console.log(
      `✍️ Calculating next ${WEEKS_TO_SCHEDULE} trigger dates for weekdays: ${weekdays.join(
        ','
      )} at ${time.hour}:${time.minute}`
    );

    // Iterate over the next ~60 days to find all matching weekdays
    // (8 weeks * 7 days = 56. We'll check 60 for safety)
    for (let i = 0; i < WEEKS_TO_SCHEDULE * 7 + 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i); // Check each day starting from today

      const dayOfWeek = date.getDay() + 1; // 1=Sunday, 7=Saturday

      // Check if this day is one the user selected
      if (weekdays.includes(dayOfWeek)) {
        // Set the time for this date
        date.setHours(time.hour, time.minute, 0, 0); // hour, minute, second, ms

        // Only schedule if this exact time is in the future
        if (date > now) {
          datesToSchedule.push(date);
        }
      }
    }

    // Now, schedule all the calculated dates
    console.log(`Scheduling ${datesToSchedule.length} individual notifications...`);

    for (const date of datesToSchedule) {
      try {
        const id = await scheduleNotificationAsync({
          content,
          trigger: date, // Use the specific Date object as the trigger
        });
        notificationIds.push(id);
        console.log(`   ...Scheduled (ID: ${id}) for ${date.toISOString()}`);
      } catch (e) {
        console.error(`Failed to schedule for date ${date}:`, e);
      }
    }

    return notificationIds;
  };

  // --- Other helper functions (no changes needed) ---

  const cancelNotificationByIdAsync = async (notificationId: string) => {
    console.log('🗑️ Canceling notification: ', notificationId);
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  const getScheduledNotificationsAsync = async () => {
    console.log('🔍 Fetching all scheduled notifications...');
    return Notifications.getAllScheduledNotificationsAsync();
  };

  const cancelAllNotificationsAsync = async () => {
    console.log('💥 Canceling ALL scheduled notifications...');
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  const value = {
    scheduleNotificationAsync,
    scheduleWeeklyReminder,
    cancelNotificationByIdAsync,
    getScheduledNotificationsAsync,
    cancelAllNotificationsAsync,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      'useNotifications must be called from within a NotificationProvider!'
    );
  }

  return context;
};

export { NotificationsProvider, useNotifications };
