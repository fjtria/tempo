import { NotificationsProvider } from '@/hooks/useNotifications';
import { RealmProvider } from '@realm/react';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <RealmProvider>
      <NotificationsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </NotificationsProvider>
    </RealmProvider>
  );
}
