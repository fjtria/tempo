import { useNotifications } from '@/hooks/useNotifications';
import { MedicationReminder } from '@/models/MedicationReminder';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useQuery, useRealm } from '@realm/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView, // Changed from FlatList to ScrollView
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BSON } from 'realm';

// 1 = sunday, 7 = saturday
const DAYS_OF_WEEK = [
  { id: 1, name: 'Su' },
  { id: 2, name: 'Mo' },
  { id: 3, name: 'Tu' },
  { id: 4, name: 'We' },
  { id: 5, name: 'Th' },
  { id: 6, name: 'Fr' },
  { id: 7, name: 'Sa' },
];

type DayKey = 1 | 2 | 3 | 4 | 5 | 6 | 7;
const DAY_NAMES_MAP: Record<DayKey, string> = {
  1: 'Su',
  2: 'Mo',
  3: 'Tu',
  4: 'We',
  5: 'Th',
  6: 'Fr',
  7: 'Sa',
};

const getInitialTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
};

const calculateNextTrigger = (
  reminder: MedicationReminder,
  now: Date
): Date | null => {
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayOfWeek = checkDate.getDay() + 1; 

    if (reminder.weekdays.includes(dayOfWeek)) {
      const triggerDate = new Date(checkDate);
      triggerDate.setHours(reminder.hour, reminder.minute, 0, 0);
      if (triggerDate > now) return triggerDate;
    }
  }
  for (let i = 7; i < 14; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayOfWeek = checkDate.getDay() + 1;
    if (reminder.weekdays.includes(dayOfWeek)) {
      const triggerDate = new Date(checkDate);
      triggerDate.setHours(reminder.hour, reminder.minute, 0, 0);
      return triggerDate;
    }
  }
  return null;
};

const formatNextTrigger = (date: Date | null): string => {
  if (!date) return 'N/A';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow =
    date.toDateString() ===
    new Date(now.setDate(now.getDate() + 1)).toDateString();

  const time = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (isToday) return `Today at ${time}`;
  if (isTomorrow) return `Tomorrow at ${time}`;
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const formatDays = (weekdays: number[]): string => {
  const sortedDays = [...weekdays].sort();
  if (sortedDays.length === 7) return 'Every day';
  return sortedDays.map((day) => DAY_NAMES_MAP[day as DayKey] || '?').join(', ');
};

export default function MedicationsScreen() {
  const { scheduleWeeklyReminder, cancelNotificationByIdAsync } = useNotifications();
  const realm = useRealm();
  const medicationReminders = useQuery(MedicationReminder);

  const [medicationName, setMedicationName] = useState('');
  const [time, setTime] = useState(getInitialTime());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [editingReminderId, setEditingReminderId] = useState<BSON.ObjectId | null>(null);

  const sortedReminders = useMemo(() => {
    const now = new Date();
    return medicationReminders
      .map((reminder) => ({
        reminder,
        nextTrigger: calculateNextTrigger(reminder, now),
      }))
      .filter((item) => item.nextTrigger)
      .sort(
        (a, b) =>
          (a.nextTrigger as Date).getTime() - (b.nextTrigger as Date).getTime()
      );
  }, [medicationReminders]);

  const resetForm = useCallback(() => {
    setMedicationName('');
    setSelectedDays([]);
    setTime(getInitialTime());
    setEditingReminderId(null);
  }, []);

  useEffect(() => {
    if (editingReminderId) {
      const reminder = realm.objectForPrimaryKey('MedicationReminder', editingReminderId);
      if (reminder) {
        setMedicationName(reminder.name as string);
        setSelectedDays(Array.from(reminder.weekdays as number[]));
        const newTime = getInitialTime();
        newTime.setHours(reminder.hour as number, reminder.minute as number, 0, 0);
        setTime(newTime);
      }
    } else {
      resetForm();
    }
  }, [editingReminderId, realm, resetForm]);

  const onTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newTime = new Date(selectedDate);
      newTime.setSeconds(0);
      newTime.setMilliseconds(0);
      setTime(newTime);
    }
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveReminder = async () => {
    if (!medicationName.trim()) {
      Alert.alert('Error', 'Please enter a medication name.');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day.');
      return;
    }

    const hour = time.getHours();
    const minute = time.getMinutes();
    const sortedDays = [...selectedDays].sort();
    const content = {
      title: 'Medication Reminder',
      body: `Time to take your ${medicationName}.`,
    };

    try {
      if (editingReminderId) {
        const reminderToUpdate = realm.objectForPrimaryKey('MedicationReminder', editingReminderId);
        if (!reminderToUpdate) return;

        for (const id of reminderToUpdate.notificationIds as string[]) {
          await cancelNotificationByIdAsync(id);
        }

        const newNotificationIds = await scheduleWeeklyReminder({
          content, time: { hour, minute }, weekdays: sortedDays,
        });

        realm.write(() => {
          reminderToUpdate.name = medicationName;
          reminderToUpdate.hour = hour;
          reminderToUpdate.minute = minute;
          reminderToUpdate.weekdays = sortedDays;
          reminderToUpdate.notificationIds = newNotificationIds;
        });
        Alert.alert('Success', `"${medicationName}" reminder updated!`);
      } else {
        const notificationIds = await scheduleWeeklyReminder({
          content, time: { hour, minute }, weekdays: sortedDays,
        });

        realm.write(() => {
          realm.create('MedicationReminder', {
            _id: new BSON.ObjectId(),
            name: medicationName,
            hour: hour,
            minute: minute,
            weekdays: sortedDays,
            notificationIds: notificationIds,
          });
        });
        Alert.alert('Success', `Reminder for "${medicationName}" scheduled!`);
      }
      resetForm();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save reminder.');
    }
  };

  const handleDelete = (reminder: MedicationReminder) => {
    Alert.alert('Delete', `Delete "${reminder.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          for (const id of reminder.notificationIds as string[]) {
            await cancelNotificationByIdAsync(id);
          }
          realm.write(() => realm.delete(reminder));
        },
      },
    ]);
  };

  const handleStartEdit = (reminder: MedicationReminder) => {
    setEditingReminderId(reminder._id);
  };

  return (
    <ScrollView style={styles.container}>
      {/* --- FORM SECTION --- */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {editingReminderId ? 'Edit Reminder' : 'Add New Reminder'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medication Name</Text>
          <TextInput
            style={styles.input}
            value={medicationName}
            onChangeText={setMedicationName}
            placeholder="e.g., Vitamin D"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowTimePicker(true)}>
            <Text style={styles.inputText}>{formatTime(time)}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Repeat</Text>
          <View style={styles.dayPickerContainer}>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.id) && styles.dayButtonSelected,
                ]}
                onPress={() => toggleDay(day.id)}
              >
                <Text style={[
                  styles.dayButtonText,
                  selectedDays.includes(day.id) && styles.dayButtonTextSelected,
                ]}>{day.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSaveReminder}>
          <Text style={styles.buttonText}>
            {editingReminderId ? 'Update Reminder' : 'Schedule Reminder'}
          </Text>
        </TouchableOpacity>
        
        {editingReminderId && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditingReminderId(null)}>
            <Text style={styles.cancelButtonText}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* --- LIST SECTION --- */}
      <Text style={styles.listHeader}>Scheduled Reminders</Text>
      
      {sortedReminders.length === 0 ? (
        <Text style={styles.emptyText}>No reminders scheduled.</Text>
      ) : (
        sortedReminders.map(({ reminder, nextTrigger }) => (
          <View key={reminder._id.toHexString()} style={styles.itemContainer}>
            <View style={styles.itemTextContainer}>
              <Text style={styles.itemName}>{reminder.name as string}</Text>
              <Text style={styles.itemDetails}>
                {formatTime(nextTrigger!)} | {formatDays(reminder.weekdays as any)}
              </Text>
              <Text style={styles.itemNext}>
                Next: {formatNextTrigger(nextTrigger)}
              </Text>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity onPress={() => handleStartEdit(reminder)}>
                <Ionicons name="pencil" size={24} color="#6C4386" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(reminder)}>
                <Ionicons name="trash-outline" size={24} color="#864343" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      
      {/* Padding for bottom of scroll */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0F6',
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F5F0F6',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020202',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#6C4386',
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    color: '#020202',
    backgroundColor: 'white',
    borderColor: '#6C4386',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  inputText: {
    color: '#020202',
    fontSize: 16,
  },
  dayPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#6C4386',
  },
  dayButtonSelected: {
    backgroundColor: '#6C4386',
  },
  dayButtonText: {
    color: '#020202',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayButtonTextSelected: {
    color: '#F5F0F6',
  },
  button: {
    backgroundColor: '#6C4386',
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#F5F0F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6C4386',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#6C4386',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020202',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  },
  itemContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#6C4386',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020202',
  },
  itemDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  itemNext: {
    fontSize: 14,
    color: '#6C4386',
    fontWeight: '600',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginLeft: 16,
  },
});