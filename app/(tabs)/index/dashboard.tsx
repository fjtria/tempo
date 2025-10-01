import { useNotifications } from '@/hooks/useNotifications';
import * as Notifications from 'expo-notifications';
import { Link } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function Dashboard() {
  const { scheduleNotificationAsync, cancelNotificationAsync } =
    useNotifications();

  const sendNotification = () => {
    scheduleNotificationAsync({
      content: {
        title: "🧪 Test notification!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 2,
      },
    });
  };

  return (
    <View style={styles.container}>  
      <View style={styles.remindersContainer}>
        <Text style={styles.text}>Notifications Demo:</Text>
        <Text style={styles.text}>Sends a notification in 2 seconds.</Text>
        <Button title='Send' onPress={sendNotification}/>
        <Button title='Cancel' onPress={cancelNotificationAsync}/>
      </View>
      <View style={styles.screenContainer}>
        <Link href="/medications" style={styles.screenLink}>
          Medications
        </Link>
        <Link href="/nutrition" style={styles.screenLink}>
          Nutrition
        </Link>
        <Link href="/hydration" style={styles.screenLink}>
          Hydration
        </Link>
        <Link href="/cycleTracking" style={styles.screenLink}>
          Cycle Tracking
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
  },
  remindersContainer: {
    flex: 1,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    marginHorizontal: 24,
    flex: 1,
    alignItems: 'flex-start'
  },
  text: {
    color: '#fff',
  },
  screenLink: {
    marginVertical: 16,
    fontSize: 20,
    textDecorationLine: 'underline',
    color: '#fff',
  },
});
