import { useNotifications } from '@/hooks/useNotifications';
import { CycleEntry } from '@/models/CycleEntry';
import { CyclePrediction } from '@/models/CyclePrediction';
import { useQuery, useRealm } from '@realm/react';
import * as Notifications from 'expo-notifications';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { BSON } from 'realm';

const THEME_COLOR = '#864343';

// add days to a date
const addDays = (date: Date, days: number) => {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
};

// normalize date string for the calendar
const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// create consistent date object in UTC
const createDateFromString = (dateString: string) => {
  return new Date(`${dateString}T12:00:00.000Z`);
};

// get today's date string in local time
const getLocalTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CycleTrackingScreen() {
  const realm = useRealm();
  const { scheduleNotificationAsync, cancelNotificationByIdAsync } = useNotifications();
  const periodEntries = useQuery(CycleEntry).sorted('date');
  const predictionData = useQuery(CyclePrediction);

  const nextPrediction = predictionData[0]; 
  const todayString = getLocalTodayString();

  // PREDICTION ALGORITHM
  const calculateNextPrediction = useCallback((entries: Realm.Results<CycleEntry>): Date | null => {
    // get all unique period start dates
    const sortedDates = Array.from(entries)
      .map(entry => entry.date.getTime())
      .sort((a, b) => a - b);
    
    if (sortedDates.length === 0) {
      return null;
    }

    const startDates: Date[] = [];
    if (sortedDates.length > 0) {
      startDates.push(new Date(sortedDates[0]));
    }
    
    for (let i = 1; i < sortedDates.length; i++) {
        const currentDate = new Date(sortedDates[i]);
        const previousDate = new Date(sortedDates[i - 1]);
        
        // if the gap is > 1 day, the current date is the start of a new period
        if ((currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24) > 1) {
            startDates.push(currentDate);
        }
    }
    
    // calculate cycle lengths
    const cycleLengths: number[] = [];
    for (let i = 1; i < startDates.length; i++) {
      const length = (startDates[i].getTime() - startDates[i - 1].getTime()) / (1000 * 3600 * 24);
      cycleLengths.push(length);
    }

    // determine the cycle length to use
    let averageCycleLength: number;

    if (cycleLengths.length >= 2) {
      const sum = cycleLengths.reduce((acc, len) => acc + len, 0);
      averageCycleLength = Math.round(sum / cycleLengths.length);
    } else {
      averageCycleLength = 28;
    }
    
    // predict the next period start date
    const lastStartDate = startDates[startDates.length - 1];
    
    if (lastStartDate.getTime() >= new Date().setHours(0, 0, 0, 0)) {
        return lastStartDate;
    }

    return addDays(lastStartDate, averageCycleLength);
  }, []);

  const updatePredictionAndNotification = useCallback(async (
    nextPredictedDate: Date | null
  ) => {
    // prevent infinite loops
    const currentStoredDate = nextPrediction?.nextPredictedDate?.getTime();
    const newCalculatedDate = nextPredictedDate?.getTime();

    if (currentStoredDate === newCalculatedDate) {
      return;
    }

    // cancel existing notifications
    if (nextPrediction?.notificationIds) {
        for (const id of nextPrediction.notificationIds) {
            await cancelNotificationByIdAsync(id);
        }
    }

    if (!nextPredictedDate) {
      if (nextPrediction) {
        realm.write(() => realm.delete(nextPrediction));
      }
      return;
    }

    // schedule new notifications
    const newNotificationIds: string[] = [];
    const today = new Date();
    
    // notification 3 days before
    const date3DaysBefore = addDays(nextPredictedDate, -3);
    if (date3DaysBefore.getTime() > today.getTime()) {
        const id = await scheduleNotificationAsync({
            content: {
                title: 'Cycle Prediction Alert',
                body: 'Your predicted period start is in 3 days.',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: date3DaysBefore,
            },
        });
        newNotificationIds.push(id);
    }

    // notification day of
    const dateDayOf = new Date(nextPredictedDate);
    dateDayOf.setHours(9, 0, 0, 0);

    if (dateDayOf.getTime() > today.getTime()) {
        const id = await scheduleNotificationAsync({
            content: {
                title: 'Cycle Prediction Alert',
                body: 'Your predicted period starts today.',
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: dateDayOf,
            },
        });
        newNotificationIds.push(id);
    }

    // update cycle prediction in Realm
    realm.write(() => {
        if (nextPrediction) {
            nextPrediction.nextPredictedDate = nextPredictedDate;
            nextPrediction.notificationIds = newNotificationIds;
        } else {
            realm.create('CyclePrediction', {
                _id: new BSON.ObjectId(),
                nextPredictedDate: nextPredictedDate,
                notificationIds: newNotificationIds,
            });
        }
    });

  }, [realm, nextPrediction, scheduleNotificationAsync, cancelNotificationByIdAsync]);

  // --- recalculate and reschedule on data change ---
  useEffect(() => {
    const nextPredictedDate = calculateNextPrediction(periodEntries);
    updatePredictionAndNotification(nextPredictedDate);
  }, [periodEntries, calculateNextPrediction, updatePredictionAndNotification]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    // mark logged period days
    periodEntries.forEach((entry) => {
      const dateKey = formatDateKey(entry.date);
      marks[dateKey] = {
        selected: true,
        selectedColor: THEME_COLOR,
      };
    });

    // mark predicted period start day
    if (nextPrediction?.nextPredictedDate) {
      const dateKey = formatDateKey(nextPrediction.nextPredictedDate);
      marks[dateKey] = {
        customStyles: {
          container: {
            backgroundColor: 'white',
            borderColor: THEME_COLOR,
            borderWidth: 2,
            justifyContent: 'center',
          },
          text: {
            color: THEME_COLOR,
            fontWeight: 'bold',
          },
        },
      };
    }

    return marks;
  }, [periodEntries, nextPrediction]);

  // handle date toggles
  const onDayPress = useCallback(
    (day: DateData) => {
      const dateString = day.dateString;

      // gray future dates
      const currentToday = getLocalTodayString();
      if (dateString > currentToday) {
        Alert.alert("Future Date", "You cannot log cycle dates in the future.");
        return;
      }

      const existingEntry = periodEntries.find(
        (entry) => formatDateKey(entry.date) === dateString
      );

      realm.write(() => {
        if (existingEntry) {
          realm.delete(existingEntry);
        } else {
          realm.create('CycleEntry', {
            _id: new BSON.ObjectId(),
            date: createDateFromString(dateString),
          });
        }
      });
    },
    [realm, periodEntries]
  );

  const predictedDateKey = nextPrediction?.nextPredictedDate
    ? formatDateKey(nextPrediction.nextPredictedDate)
    : null;
    
  const formattedPredictedDate = predictedDateKey
    ? new Date(predictedDateKey).toLocaleDateString(undefined, {
        timeZone: 'UTC',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })
    : 'N/A';

  let predictionHintText = 'Log more dates to predict.';
  if (nextPrediction?.nextPredictedDate) {
      const now = new Date();
      const predDate = nextPrediction.nextPredictedDate;
      const date3DaysBefore = addDays(predDate, -3);
      const dateDayOf = new Date(predDate);
      dateDayOf.setHours(9, 0, 0, 0);

      if (date3DaysBefore.getTime() > now.getTime()) {
          predictionHintText = `Next notification: ${date3DaysBefore.toLocaleDateString([], { month: 'short', day: 'numeric' })} (3 days before)`;
      } else if (dateDayOf.getTime() > now.getTime()) {
          predictionHintText = `Next notification: ${dateDayOf.toLocaleDateString([], { month: 'short', day: 'numeric' })} (Day of)`;
      } else {
          predictionHintText = 'Prediction coming up soon!';
      }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}> 
        <View style={styles.predictionBox}>
            <Text style={styles.predictionLabel}>Next Predicted Period:</Text>
            <Text style={styles.predictionValue}>
                {formattedPredictedDate}
            </Text>
            <Text style={styles.predictionHint}>
                {predictionHintText}
            </Text>
        </View>
        <Text style={styles.headerTitle}>Log Cycle Dates</Text>
        <Text style={styles.subtitle}>
          Tap dates on the calendar to log your period.
        </Text>
      </View>
      
      <View style={styles.calendarContainer}>
        <Calendar
          theme={{
            todayTextColor: '#6C4386',
            arrowColor: '#6C4386',
            selectedDayBackgroundColor: THEME_COLOR,
            selectedDayTextColor: '#ffffff',
            textDayFontWeight: '600',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold',
          }}
          markedDates={markedDates}
          onDayPress={onDayPress}
          enableSwipeMonths={true}
          markingType={'custom'}
          maxDate={todayString}
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>History</Text>
        <Text style={styles.summaryText}>
          You have logged <Text style={{fontWeight: 'bold', color: THEME_COLOR}}>{periodEntries.length}</Text> days of cycle data.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0F6',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F5F0F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020202',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6C4386',
  },
  calendarContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryContainer: {
    padding: 16,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#020202',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#333',
  },
  predictionBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  predictionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6C4386',
    marginTop: 4,
  },
  predictionHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  }
});