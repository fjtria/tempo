// utils/reminders.ts

// Define a base type that all our reminder models share
type BaseReminder = {
  hour: number;
  minute: number;
  weekdays?: number[]; // Optional: Medication has this, others don't
};

/**
 * Calculates the very next date and time a reminder will fire.
 */
export const calculateNextTrigger = (
  reminder: BaseReminder,
  now: Date
): Date | null => {
  // Default to daily if 'weekdays' isn't provided
  const weekdays = reminder.weekdays || [1, 2, 3, 4, 5, 6, 7];

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayOfWeek = checkDate.getDay() + 1; // 1 = sunday, 7 = saturday

    if (weekdays.includes(dayOfWeek)) {
      const triggerDate = new Date(checkDate);
      triggerDate.setHours(reminder.hour, reminder.minute, 0, 0);

      if (triggerDate > now) {
        return triggerDate;
      }
    }
  }
  
  // If no date in the next 7 days is found, check the first match next week
  for (let i = 7; i < 14; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayOfWeek = checkDate.getDay() + 1;
    if (weekdays.includes(dayOfWeek)) {
      const triggerDate = new Date(checkDate);
      triggerDate.setHours(reminder.hour, reminder.minute, 0, 0);
      return triggerDate;
    }
  }
  return null;
};

/**
 * Formats the next trigger date for display on the dashboard.
 */
export const formatNextTrigger = (date: Date | null): string => {
  if (!date) return 'N/A';
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  
  if (checkDate.getTime() === today.getTime()) return `Today at ${time}`;
  if (checkDate.getTime() === tomorrow.getTime()) return `Tomorrow at ${time}`;
  
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a time for display (e.g., "10:30 AM")
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};