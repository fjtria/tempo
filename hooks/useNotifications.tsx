import * as Notifications from 'expo-notifications';
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
} from 'react';
import { Platform } from 'react-native';

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
  getScheduledNotificationsAsync: () => Promise<Notifications.NotificationRequest[]>;
  cancelAllNotificationsAsync: () => Promise<void>;
}

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

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Android channel
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

  // schedules single, generic notification
  const scheduleNotificationAsync = async (
    request: Notifications.NotificationRequestInput
  ) => {
    const id = await Notifications.scheduleNotificationAsync(request);
    console.log('SCHEDULING NOTIFICATION: ', id);
    return id;
  };

  // schedules weekly reminders
  const scheduleWeeklyReminder = async (
    options: ScheduleWeeklyReminderOptions
  ) => {
    const { content, time, weekdays } = options;
    const notificationIds: string[] = [];
    
    const now = new Date();
    const datesToSchedule: Date[] = [];
    
    const MAX_DAYS_TO_CHECK = 60; 
    const NOTIFICATIONS_TO_SCHEDULE = 8; 

    console.log(
      `CALCULATING NEXT ${NOTIFICATIONS_TO_SCHEDULE} DATES FOR: ${weekdays.join(
        ','
      )} at ${time.hour}:${time.minute}`
    );

    for (let i = 0; i < MAX_DAYS_TO_CHECK; i++) {
      // stop if we found enough dates
      if (datesToSchedule.length >= NOTIFICATIONS_TO_SCHEDULE) {
        break;
      }

      const date = new Date();
      date.setDate(date.getDate() + i); // check each day starting from today
      const dayOfWeek = date.getDay() + 1;

      // check if this day is one the user selected
      if (weekdays.includes(dayOfWeek)) {
        // set the time for this date
        date.setHours(time.hour, time.minute, 0, 0); // hour, minute, second, ms

        // only schedule if this exact time is in the future
        if (date > now) {
          datesToSchedule.push(date);
        }
      }
    }

    // schedule all the calculated dates
    console.log(`SCHEDULING ${datesToSchedule.length} NOTIFICATIONS`);

    for (const date of datesToSchedule) {
      try {
        const id = await scheduleNotificationAsync({
          content,
          trigger: { 
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: date 
          },
        });
        notificationIds.push(id);
        console.log(`SCHEDULED NOTIFICATION: ${id} FOR ${date.toISOString()}`);
      } catch (e) {
        console.error(`FAILED SCHEDULING FOR ${date}:`, e);
      }
    }

    return notificationIds;
  };

  const cancelNotificationByIdAsync = async (notificationId: string) => {
    console.log('CANCELING NOTIFICATION: ', notificationId);
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  };

  const getScheduledNotificationsAsync = async () => {
    console.log('FETCHING ALL SCHEDULED NOTIFICATIONS');
    return Notifications.getAllScheduledNotificationsAsync();
  };

  const cancelAllNotificationsAsync = async () => {
    console.log('CANCELING ALL SCHEDULED NOTIFICATIONS');
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
