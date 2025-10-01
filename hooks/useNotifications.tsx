// Adapted from https://dev.to/walter_bloggins/local-notifications-in-expo-2p47

import * as Notifications from "expo-notifications";
import React, {
    createContext,
    FC,
    PropsWithChildren,
    useContext,
    useEffect,
    useRef,
} from "react";

interface NotificationContextType {
  scheduleNotificationAsync: (
    request: Notifications.NotificationRequestInput
  ) => Promise<void>;
  cancelNotificationAsync: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationContextType | undefined>(
  undefined
);

const NotificationsProvider: FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    const configureNotificationsAsync = async () => {
      const { granted } = await Notifications.requestPermissionsAsync();
      if (!granted) {
        return console.warn("⚠️ Notification Permissions not granted!");
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true
        }),
      });
    };
    configureNotificationsAsync();
  }, []);

  const scheduledNotificationRef = useRef<string>("");

  const scheduleNotificationAsync = async (
    request: Notifications.NotificationRequestInput
  ) => {
    const notification = await Notifications.scheduleNotificationAsync(request);
    scheduledNotificationRef.current = notification;
    console.log(
      "✍️ Scheduling notification: ",
      scheduledNotificationRef.current
    );
  };

  const cancelNotificationAsync = async () => {
    console.log(
      "🗑️ Canceling notification: ",
      scheduledNotificationRef.current
    );
    await Notifications.cancelScheduledNotificationAsync(
      scheduledNotificationRef.current
    );
    scheduledNotificationRef.current = "";
  };

  const value = { scheduleNotificationAsync, cancelNotificationAsync };

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
      "useNotifications must be called from within a NotificationProvider!"
    );
  }

  return context;
};

export { NotificationsProvider, useNotifications };
