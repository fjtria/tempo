import { useNotifications } from '@/hooks/useNotifications';
import { HydrationReminder } from '@/models/HydrationReminder';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useQuery, useRealm } from '@realm/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BSON } from 'realm';

const getInitialTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 1);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
};

const calculateNextTrigger = (
  reminder: HydrationReminder,
  now: Date
): Date | null => {
  const weekdays = [1, 2, 3, 4, 5, 6, 7]; // daily

  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayOfWeek = checkDate.getDay() + 1;

    if (weekdays.includes(dayOfWeek)) {
      const triggerDate = new Date(checkDate);
      triggerDate.setHours(reminder.hour as number, reminder.minute as number, 0, 0);

      if (triggerDate > now) {
        return triggerDate;
      }
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

export default function HydrationScreen() {
  const { scheduleWeeklyReminder, cancelNotificationByIdAsync } =
    useNotifications();

  const realm = useRealm();
  const hydrationReminders = useQuery(HydrationReminder);

  // form state
  const [reminderName, setReminderName] = useState('');
  const [time, setTime] = useState(getInitialTime());
  const [showTimePicker, setShowTimePicker] = useState(false);

  // edit state
  const [editingReminderId, setEditingReminderId] =
    useState<BSON.ObjectId | null>(null);

  // sorting
  const sortedReminders = useMemo(() => {
    const now = new Date();
    return hydrationReminders
      .map((reminder) => ({
        reminder,
        nextTrigger: calculateNextTrigger(reminder, now),
      }))
      .filter((item) => item.nextTrigger)
      .sort(
        (a, b) =>
          (a.nextTrigger as Date).getTime() - (b.nextTrigger as Date).getTime()
      );
  }, [hydrationReminders]);

  const resetForm = useCallback(() => {
    setReminderName('');
    setTime(getInitialTime());
    setEditingReminderId(null);
  }, []);

  useEffect(() => {
    if (editingReminderId) {
      const reminder = realm.objectForPrimaryKey(
        'HydrationReminder',
        editingReminderId
      );
      if (reminder) {
        setReminderName(reminder.name as string);
        const newTime = getInitialTime();
        newTime.setHours(reminder.hour as number, reminder.minute as number, 0, 0);
        setTime(newTime);
      }
    } else {
      resetForm();
    }
  }, [editingReminderId, realm, resetForm]);

  const onTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      const newTime = new Date(selectedDate);
      newTime.setSeconds(0);
      newTime.setMilliseconds(0);
      setTime(newTime);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSaveReminder = async () => {
    if (!reminderName.trim()) {
      Alert.alert('Error', 'Please enter a reminder name.');
      return;
    }

    const hour = time.getHours();
    const minute = time.getMinutes();
    const weekdays = [1, 2, 3, 4, 5, 6, 7]; // daily
    const content = {
      title: 'Hydration Reminder',
      body: `Time for ${reminderName}.`,
    };

    try {
      if (editingReminderId) {
        const reminderToUpdate = realm.objectForPrimaryKey(
          'HydrationReminder',
          editingReminderId
        );
        if (!reminderToUpdate) return;

        for (const id of reminderToUpdate.notificationIds as string[]) {
          await cancelNotificationByIdAsync(id);
        }

        const newNotificationIds = await scheduleWeeklyReminder({
          content,
          time: { hour, minute },
          weekdays: weekdays,
        });

        realm.write(() => {
          reminderToUpdate.name = reminderName;
          reminderToUpdate.hour = hour;
          reminderToUpdate.minute = minute;
          reminderToUpdate.notificationIds = newNotificationIds;
        });

        Alert.alert('Success', `"${reminderName}" reminder updated!`);
      } else {
        const notificationIds = await scheduleWeeklyReminder({
          content,
          time: { hour, minute },
          weekdays: weekdays,
        });

        realm.write(() => {
          realm.create('HydrationReminder', {
            _id: new BSON.ObjectId(),
            name: reminderName,
            hour: hour,
            minute: minute,
            notificationIds: notificationIds,
          });
        });

        Alert.alert('Success', `Reminder for "${reminderName}" scheduled!`);
      }

      resetForm();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save reminder.');
    }
  };

  const handleDelete = (reminder: HydrationReminder) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete the "${reminder.name as string}" reminder?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const id of reminder.notificationIds as string[]) {
                await cancelNotificationByIdAsync(id);
              }
              realm.write(() => {
                realm.delete(reminder);
              });
            } catch (e) {
              console.error('Failed to delete reminder:', e);
              Alert.alert('Error', 'Failed to delete reminder.');
            }
          },
        },
      ]
    );
  };

  const handleStartEdit = (reminder: HydrationReminder) => {
    setEditingReminderId(reminder._id);
  };

  const renderHeader = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>
        {editingReminderId ? 'Edit Reminder' : 'Add New Reminder'}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Label</Text>
        <TextInput
          style={styles.input}
          value={reminderName}
          onChangeText={setReminderName}
          placeholder="e.g., Morning, Finish Bottle"
          placeholderTextColor="#777"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimePicker(true)}
        >
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

      <TouchableOpacity style={styles.button} onPress={handleSaveReminder}>
        <Text style={styles.buttonText}>
          {editingReminderId ? 'Update Reminder' : 'Schedule Reminder'}
        </Text>
      </TouchableOpacity>
      {editingReminderId && (
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => setEditingReminderId(null)}
        >
          <Text style={styles.cancelButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.listHeader}>Scheduled Reminders</Text>
    </View>
  );

  type ReminderItem = {
    reminder: HydrationReminder;
    nextTrigger: Date | null;
  };

const renderReminderItem = ({ item }: { item: ReminderItem }) => {
    const { reminder, nextTrigger } = item;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemName}>{reminder.name as string}</Text>
          <Text style={styles.itemDetails}>
            {formatTime(nextTrigger!)} | Daily
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
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={sortedReminders}
      keyExtractor={(item) => item.reminder._id.toHexString()}
      renderItem={renderReminderItem}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={
        <Text style={styles.emptyText}>No reminders scheduled.</Text>
      }
    />
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
    paddingHorizontal: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
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