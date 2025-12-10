import ReminderScreen from '@/components/ReminderScreen';
import { useReminderManager } from '@/hooks/useReminderManager';
import { HydrationReminder } from '@/models/HydrationReminder';
import React from 'react';

const DAILY_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

export default function HydrationScreen() {
  const manager = useReminderManager({
    modelName: 'HydrationReminder',
    modelClass: HydrationReminder,
    defaultDays: DAILY_WEEKDAYS,
  });

  return (
    <ReminderScreen
      manager={manager}
      themeColor="#6C4386"
      title="Add New Hydration Reminder"
      placeholder="e.g., Morning Check-In"
      showDayPicker={false}
    />
  );
}