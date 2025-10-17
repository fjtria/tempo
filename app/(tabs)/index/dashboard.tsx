import { useNotifications } from '@/hooks/useNotifications';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
        <TouchableOpacity style={styles.button} onPress={sendNotification}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={cancelNotificationAsync}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.screenContainer}>
        <Link href="/medications" style={[styles.screenLink, {backgroundColor: '#E6A445'}]}>
          <Ionicons name={'heart-outline'} color={'#F5F0F6'} size={24} />
          <Text style={styles.screenLinkText}>Medications</Text>
        </Link>

        <Link href="/nutrition" style={[styles.screenLink, {backgroundColor: '#438669'}]}>
          <Ionicons name={'nutrition-outline'} color={'#F5F0F6'} size={24} />
          <Text style={styles.screenLinkText}>Nutrition</Text>
        </Link>

        <Link href="/hydration" style={[styles.screenLink, {backgroundColor: '#436C86'}]}>
          <Ionicons name={'water-outline'} color={'#F5F0F6'} size={24} />  
          <Text style={styles.screenLinkText}>Hydration</Text>
        </Link>

        <Link href="/cycleTracking" style={[styles.screenLink, {backgroundColor: '#864343'}]}>
          <Ionicons name={'repeat-outline'} color={'#F5F0F6'} size={24} />
          <Text style={styles.screenLinkText}>Cycle Tracking</Text>
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
    flex: 1,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    width: '100%',
    paddingHorizontal: 16,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 36,
    justifyContent: 'space-between',
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
  screenLink: {
    width: '45%',
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6C4386',
    borderRadius: 16,
  },
  screenLinkText: {
    color: '#F5F0F6',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
