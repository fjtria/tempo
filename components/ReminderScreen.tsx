import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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

const DAY_NAMES_MAP: Record<number, string> = {
  1: 'Su', 2: 'Mo', 3: 'Tu', 4: 'We', 5: 'Th', 6: 'Fr', 7: 'Sa',
};

// helper logic for sorting
const calculateNextTrigger = (hour: number, minute: number, weekdays: number[], now: Date): Date | null => {
  for (let i = 0; i < 14; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);
    const dayOfWeek = checkDate.getDay() + 1;
    if (weekdays.includes(dayOfWeek)) {
      const triggerDate = new Date(checkDate);
      triggerDate.setHours(hour, minute, 0, 0);
      if (triggerDate > now) return triggerDate;
    }
  }
  return null;
};

interface Props {
  themeColor: string;
  title: string;
  placeholder: string;
  showDayPicker?: boolean;
  manager: any;
}

export default function ReminderScreen({
  themeColor,
  title,
  placeholder,
  showDayPicker = false,
  manager,
}: Props) {
  const { reminders, form, actions, editingId } = manager;

  const sortedReminders = useMemo(() => {
    const now = new Date();
    return Array.from(reminders).map((reminder: any) => {
      // fallback for weekdays if missing in older data
      const weekdays = reminder.weekdays ? Array.from(reminder.weekdays) : [1,2,3,4,5,6,7];
      return {
        reminder,
        nextTrigger: calculateNextTrigger(reminder.hour, reminder.minute, weekdays as number[], now),
      };
    })
    .filter((item) => item.nextTrigger)
    .sort((a, b) => (a.nextTrigger as Date).getTime() - (b.nextTrigger as Date).getTime());
  }, [reminders]);

  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDays = (weekdays: number[]) => {
    if (!weekdays || weekdays.length === 7) return 'Daily';
    return weekdays.sort().map(d => DAY_NAMES_MAP[d]).join(', ');
  };

  const formatNextTriggerDisplay = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tmrw = new Date(now); tmrw.setDate(tmrw.getDate() + 1);
    const isTomorrow = date.toDateString() === tmrw.toDateString();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today at ${timeStr}`;
    if (isTomorrow) return `Tomorrow at ${timeStr}`;
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {editingId ? 'Edit Reminder' : title}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={form.setName}
            placeholder={placeholder}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => form.setShowTimePicker(true)}
          >
            <Text style={styles.inputText}>{formatTime(form.time)}</Text>
          </TouchableOpacity>
          {form.showTimePicker && (
            <DateTimePicker
              value={form.time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={form.handleTimeChange}
            />
          )}
        </View>

        {showDayPicker && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Repeat</Text>
            <View style={styles.dayPickerContainer}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayButton,
                    { borderColor: themeColor },
                    form.selectedDays.includes(day.id) && { backgroundColor: themeColor },
                  ]}
                  onPress={() => form.toggleDay(day.id)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    form.selectedDays.includes(day.id) && styles.dayButtonTextSelected,
                  ]}>{day.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.button} 
          onPress={actions.handleSave}
        >
          <Text style={styles.buttonText}>
            {editingId ? 'Update Reminder' : 'Schedule Reminder'}
          </Text>
        </TouchableOpacity>
        
        {editingId && (
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton, { borderColor: themeColor }]} 
            onPress={() => actions.setEditingId(null)}
          >
            <Text style={[styles.cancelButtonText, { color: themeColor }]}>Cancel Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {!editingId && (
        <>

          <Text style={styles.listHeader}>Scheduled Reminders</Text>  
          {sortedReminders.length === 0 ? (
            <Text style={styles.emptyText}>No reminders scheduled.</Text>
          ) : (
            sortedReminders.map(({ reminder, nextTrigger }) => (
              <View key={reminder._id.toHexString()} style={styles.itemContainer}>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemName}>{reminder.name}</Text>
                  <Text style={styles.itemDetails}>
                    {formatTime(nextTrigger)} {formatDays(reminder.weekdays ? Array.from(reminder.weekdays) : [])}
                  </Text>
                  <Text style={styles.itemNext}>
                    Next: {formatNextTriggerDisplay(nextTrigger)}
                  </Text>
                </View>
                <View style={styles.itemActions}>
                  <TouchableOpacity onPress={() => actions.setEditingId(reminder._id)}>
                    <Ionicons name="pencil" size={24} color={themeColor} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => actions.handleDelete(reminder)}>
                    <Ionicons name="trash-outline" size={24} color="#864343" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0F6'
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F5F0F6'
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020202',
    marginBottom: 16
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    color: '#6C4386',
    fontSize: 14,
    marginBottom: 4
  },
  input: {
    color: '#020202',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  inputText: {
    color: '#020202',
    fontSize: 16
  },
  dayPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  dayButtonText: {
    color: '#020202',
    fontSize: 16,
    fontWeight: 'bold'
  },
  dayButtonTextSelected: {
    color: '#F5F0F6'
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
    fontWeight: 'bold'
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    marginTop: 8
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold'
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
  },
  itemTextContainer: {
    flex: 1
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020202'
  },
  itemDetails: {
    fontSize: 14,
    marginTop: 4
  },
  itemNext: {
    color: '#6C4386',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginLeft: 16 },
});