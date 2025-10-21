import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Dashboard() {
  return (
    <View style={styles.container}>  
      
      <View style={styles.remindersContainer}>
        <Text style={styles.header}>Upcoming Reminders:</Text>
        <Text style={styles.text}>None</Text>
      </View>

      <View style={styles.screenContainer}>
        <Link href="/medications" style={[styles.screenLink, {backgroundColor: '#E6A445'}]}>
          <View style={styles.linkInnerContainer}>
            <View style={styles.screenLinkContent}>
              <Ionicons name={'heart-outline'} color={'#F5F0F6'} size={28} />
              <Text style={styles.screenLinkText}>Medications</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name={'chevron-forward-outline'} color={'#F5F0F6'} size={20} />
          </View>
        </Link>

        <Link href="/nutrition" style={[styles.screenLink, {backgroundColor: '#438669'}]}>
          <View style={styles.linkInnerContainer}>
            <View style={styles.screenLinkContent}>
              <Ionicons name={'nutrition-outline'} color={'#F5F0F6'} size={28} />
              <Text style={styles.screenLinkText}>Nutrition</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name={'chevron-forward-outline'} color={'#F5F0F6'} size={20} />
          </View>
        </Link>

        <Link href="/hydration" style={[styles.screenLink, {backgroundColor: '#436C86'}]}>
          <View style={styles.linkInnerContainer}>
            <View style={styles.screenLinkContent}>
              <Ionicons name={'water-outline'} color={'#F5F0F6'} size={28} />  
              <Text style={styles.screenLinkText}>Hydration</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name={'chevron-forward-outline'} color={'#F5F0F6'} size={20} />
          </View>
        </Link>

        <Link href="/cycleTracking" style={[styles.screenLink, {backgroundColor: '#864343'}]}>
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
  },
  screenContainer: {
    width: '100%',
    paddingHorizontal: 16,
    flex: 1,
    rowGap: 16,
  },
  header: {
    paddingBottom: 8,
    color: '#020202',
    fontSize: 18,
    fontWeight: 'bold'
  },
  text: {
    color: '#020202',
    fontSize: 16,
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
});