import { useNotifications } from '@/hooks/useNotifications';
import { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQuery, useRealm } from '@realm/react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { BSON } from 'realm';

interface BaseReminder {
  _id: BSON.ObjectId;
  name: string;
  hour: number;
  minute: number;
  weekdays?: number[];
  notificationIds: string[];
}

interface UseReminderManagerProps {
  modelName: string;
  modelClass: any;
  defaultDays?: number[];
}

// stable empty array to prevent infinite loops if defaultDays isn't provided
const EMPTY_ARRAY: number[] = [];

export function useReminderManager({ 
  modelName, 
  modelClass, 
  defaultDays = EMPTY_ARRAY 
}: UseReminderManagerProps) {
  const realm = useRealm();
  const reminders = useQuery(modelClass);
  const { scheduleWeeklyReminder, cancelNotificationByIdAsync } = useNotifications();

  const [name, setName] = useState('');
  const [time, setTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // initialize days based on the passed default
  const [selectedDays, setSelectedDays] = useState<number[]>(defaultDays);
  
  const [editingId, setEditingId] = useState<BSON.ObjectId | null>(null);

  const resetForm = useCallback(() => {
    setName('');
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    now.setSeconds(0);
    now.setMilliseconds(0);
    setTime(now);
    // Reset to the default provided by the screen (e.g. Daily or Empty)
    setSelectedDays(defaultDays.length > 0 ? defaultDays : []);
    setEditingId(null);
  }, [defaultDays]);

  // load data when editingId changes
  useEffect(() => {
    if (editingId) {
      const item = realm.objectForPrimaryKey<BaseReminder>(modelName, editingId);
      if (item) {
        setName(item.name);
        const newTime = new Date();
        newTime.setHours(item.hour, item.minute, 0, 0);
        setTime(newTime);
        
        // use saved weekdays if available, otherwise fallback to screen default
        if (item.weekdays && item.weekdays.length > 0) {
          setSelectedDays(Array.from(item.weekdays));
        } else {
          setSelectedDays(defaultDays);
        }
      }
    } else {
      resetForm();
    }
  }, [editingId, realm, modelName, resetForm, defaultDays]);

  const handleTimeChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newTime = new Date(selectedDate);
      newTime.setSeconds(0);
      newTime.setMilliseconds(0);
      setTime(newTime);
    }
  }, []);

  const toggleDay = useCallback((dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId) ? prev.filter((id) => id !== dayId) : [...prev, dayId]
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name.');
      return;
    }
    // if not assumed daily, require day selection
    if (defaultDays.length === 0 && selectedDays.length === 0) {
      Alert.alert('Error', 'Please select at least one day.');
      return;
    }

    const hour = time.getHours();
    const minute = time.getMinutes();
    // ensure valid array of days
    const finalDays = selectedDays.length > 0 ? [...selectedDays].sort() : [1,2,3,4,5,6,7];
    
    const content = { title: `${modelName.replace('Reminder', '')} Reminder`, body: `Time for ${name}.` };

    try {
      if (editingId) {
        // update
        const itemToUpdate = realm.objectForPrimaryKey<BaseReminder>(modelName, editingId);
        if (!itemToUpdate) return;

        // cancel old
        for (const id of itemToUpdate.notificationIds) {
          await cancelNotificationByIdAsync(id);
        }

        // schedule new
        const newIds = await scheduleWeeklyReminder({
          content,
          time: { hour, minute },
          weekdays: finalDays,
        });

        // update Realm
        realm.write(() => {
          itemToUpdate.name = name;
          itemToUpdate.hour = hour;
          itemToUpdate.minute = minute;
          // cast to any to safely write 'weekdays'
          (itemToUpdate as any).weekdays = finalDays;
          itemToUpdate.notificationIds = newIds;
        });
        Alert.alert('Success', 'Reminder updated!');
      } else {
        // create
        const ids = await scheduleWeeklyReminder({
          content,
          time: { hour, minute },
          weekdays: finalDays,
        });

        realm.write(() => {
          realm.create(modelName, {
            _id: new BSON.ObjectId(),
            name: name,
            hour: hour,
            minute: minute,
            weekdays: finalDays,
            notificationIds: ids,
          });
        });
        Alert.alert('Success', 'Reminder scheduled!');
      }
      resetForm();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save reminder.');
    }
  }, [name, time, selectedDays, editingId, modelName, realm, scheduleWeeklyReminder, cancelNotificationByIdAsync, resetForm, defaultDays]);

  const handleDelete = useCallback((item: BaseReminder) => {
    Alert.alert('Delete', `Delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            for (const id of item.notificationIds) {
              await cancelNotificationByIdAsync(id);
            }
            realm.write(() => realm.delete(item));
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  }, [realm, cancelNotificationByIdAsync]);

  return {
    reminders,
    form: { name, setName, time, showTimePicker, setShowTimePicker, selectedDays, handleTimeChange, toggleDay },
    actions: { handleSave, handleDelete, setEditingId },
    editingId
  };
}