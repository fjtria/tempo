import { HydrationReminder } from '@/models/HydrationReminder';
import { MedicationReminder } from '@/models/MedicationReminder';
import { NutritionReminder } from '@/models/NutritionReminder';
import { calculateNextTrigger, formatNextTrigger } from '@/utils/reminders';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@realm/react';
import { Link } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const REMINDER_CONFIG = {
  MedicationReminder: {
    icon: 'heart-outline' as const,
    color: '#E6A445',
  },
  NutritionReminder: {
    icon: 'nutrition-outline' as const,
    color: '#438669',
  },
  HydrationReminder: {
    icon: 'water-outline' as const,
    color: '#436C86',
  },
};

type ReminderType = keyof typeof REMINDER_CONFIG;

export default function Dashboard() {
  // query all three reminder types
  const medicationReminders = useQuery(MedicationReminder);
  const nutritionReminders = useQuery(NutritionReminder);
  const hydrationReminders = useQuery(HydrationReminder);

  // combine, sort, and slice the reminders
  const upcomingReminders = useMemo(() => {
    const now = new Date();

    // combine all into one array
    const allReminders: (MedicationReminder | NutritionReminder | HydrationReminder)[] = [
      ...medicationReminders,
      ...nutritionReminders,
      ...hydrationReminders,
    ];

    // calculate next trigger, filter out past, sort by soonest, and take top 3
    return allReminders
      .map((reminder) => {
        return {
          _id: reminder._id.toHexString(),
          name: reminder.name as string,
          nextTrigger: calculateNextTrigger(reminder, now),
          type: reminder.constructor.name as ReminderType,
        };
      })
      .filter((item) => !!item.nextTrigger) // ensure future trigger
      .sort((a, b) => a.nextTrigger!.getTime() - b.nextTrigger!.getTime()) // soonest first
      .slice(0, 3); // get the top 3
  }, [medicationReminders, nutritionReminders, hydrationReminders]);

  return (
    <View style={styles.container}>
      <View style={styles.remindersContainer}>
        <Text style={styles.header}>Scheduled Reminders</Text>
        
        {upcomingReminders.length === 0 ? (
          <Text style={styles.emptyText}>No reminders scheduled.</Text>
        ) : (
          upcomingReminders.map((item) => {
            const config = REMINDER_CONFIG[item.type];
            return (
              <View
                key={item._id}
                style={[styles.reminderItem, { borderColor: config.color }]}
              >
                <Ionicons name={config.icon} size={24} color={config.color} />
                <View style={styles.reminderTextContainer}>
                  <Text style={styles.reminderName}>{item.name}</Text>
                  <Text style={[styles.reminderTime, { color: config.color }]}>
                    {formatNextTrigger(item.nextTrigger)}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.screenContainer}>
        <Link href="medications" style={[styles.screenLink, {backgroundColor: '#E6A445'}]}>
          <View style={styles.linkInnerContainer}>
            <View style={styles.screenLinkContent}>
              <Ionicons name={'heart-outline'} color={'#F5F0F6'} size={28} />
              <Text style={styles.screenLinkText}>Medications</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name={'chevron-forward-outline'} color={'#F5F0F6'} size={20} />
          </View>
        </Link>
        <Link href="nutrition" style={[styles.screenLink, {backgroundColor: '#438669'}]}>
          <View style={styles.linkInnerContainer}>
            <View style={styles.screenLinkContent}>
              <Ionicons name={'nutrition-outline'} color={'#F5F0F6'} size={28} />
              <Text style={styles.screenLinkText}>Nutrition</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name={'chevron-forward-outline'} color={'#F5F0F6'} size={20} />
          </View>
        </Link>
        <Link href="hydration" style={[styles.screenLink, {backgroundColor: '#436C86'}]}>
          <View style={styles.linkInnerContainer}>
            <View style={styles.screenLinkContent}>
              <Ionicons name={'water-outline'} color={'#F5F0F6'} size={28} />  
              <Text style={styles.screenLinkText}>Hydration</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name={'chevron-forward-outline'} color={'#F5F0F6'} size={20} />
          </View>
        </Link>
        <Link href="cycleTracking" style={[styles.screenLink, {backgroundColor: '#864343'}]}>
          <View style={styles.linkInnerContainer}>
            <View style={styles.screenLinkContent}>
              <Ionicons name={'repeat-outline'} color={'#F5F0F6'} size={28} />
              <Text style={styles.screenLinkText}>Cycle Tracking</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name={'chevron-forward-outline'} color={'#F5F0F6'} size={20} />
          </View>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0F6',
  },
  remindersContainer: {
    padding: 16,
    flex: 1,
    gap: 12,
  },
  screenContainer: {
    width: '100%',
    paddingHorizontal: 16,
    flex: 1,
    rowGap: 16,
  },
  header: {
    paddingBottom: 4, // Adjusted padding
    color: '#020202',
    fontSize: 18,
    fontWeight: 'bold',
  },
  text: {
    color: '#020202',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 20,
  },
  button: {
    width: 160,
    backgroundColor: '#6C4386',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#F5F0F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  screenLink: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 16,
  },
  linkInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  screenLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenLinkText: {
    color: '#F5F0F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reminderItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
  },
  reminderTextContainer: {
    flex: 1,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#020202',
  },
  reminderTime: {
    fontSize: 14,
    fontWeight: '600',
  },
});