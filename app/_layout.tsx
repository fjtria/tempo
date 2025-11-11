import { NotificationsProvider } from '@/hooks/useNotifications';
import { MedicationReminder } from '@/models/MedicationReminder';
import { Profile } from '@/models/Profile';
import { RealmProvider } from '@realm/react';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <RealmProvider
      schema={[Profile, MedicationReminder]}
      deleteRealmIfMigrationNeeded={true}
    >
      <NotificationsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </NotificationsProvider>
    </RealmProvider>
  );
}
