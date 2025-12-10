import ReminderScreen from '@/components/ReminderScreen';
import { useReminderManager } from '@/hooks/useReminderManager';
import { MedicationReminder } from '@/models/MedicationReminder';
import React from 'react';

export default function MedicationsScreen() {
  const manager = useReminderManager({
    modelName: 'MedicationReminder',
    modelClass: MedicationReminder,
  });

  return (
    <ReminderScreen
      manager={manager}
      themeColor="#6C4386"
      title="Add New Medication"
      placeholder="e.g., Vitamin D"
      showDayPicker={true}
    />
  );
}