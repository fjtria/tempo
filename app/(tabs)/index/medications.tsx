import { useNotifications } from '@/hooks/useNotifications';
import * as Notifications from 'expo-notifications';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function MedicationsScreen() {
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
      <View style={styles.notificationsContainer}>
        <Text style={styles.text}>Notifications Demo:</Text>
        <Text style={styles.text}>Sends a notification in 2 seconds.</Text>
        <TouchableOpacity style={styles.button} onPress={sendNotification}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={cancelNotificationAsync}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
    notificationsContainer: {
    flex: 1,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#020202',
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
});
