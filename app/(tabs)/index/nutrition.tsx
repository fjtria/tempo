import ReminderScreen from '@/components/ReminderScreen';
import { useReminderManager } from '@/hooks/useReminderManager';
import { NutritionReminder } from '@/models/NutritionReminder';
import React from 'react';

const DAILY_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];

export default function NutritionScreen() {
  const manager = useReminderManager({
    modelName: 'NutritionReminder',
    modelClass: NutritionReminder,
    defaultDays: DAILY_WEEKDAYS,
  });

  return (
    <ReminderScreen
      manager={manager}
      themeColor="#6C4386"
      title="Add New Nutrition Reminder"
      placeholder="e.g., Breakfast"
      showDayPicker={false}
    />
  );
}