import { NotificationsProvider } from '@/hooks/useNotifications';
import { HydrationReminder } from '@/models/HydrationReminder';
import { MedicationReminder } from '@/models/MedicationReminder';
import { NutritionReminder } from '@/models/NutritionReminder';
import { Profile } from '@/models/Profile';
import { RealmProvider } from '@realm/react';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <RealmProvider
      schema={[
        Profile,
        MedicationReminder,
        NutritionReminder,
        HydrationReminder
      ]}
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
