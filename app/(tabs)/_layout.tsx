import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import React from 'react';


export default function TabLayout() {
  return (
    <Tabs
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#6C4386',
            tabBarStyle: {
            backgroundColor: '#F5F0F6'
            },
        }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart-sharp' : 'heart-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
            title: 'Profile',
            headerShown: true,
            headerStyle: {
                backgroundColor: '#6C4386',
            },
            headerShadowVisible: false,
            headerTintColor: '#F5F0F6',
            tabBarIcon: ({ color, focused }) => (
                <Ionicons name={focused ? 'person-sharp' : 'person-outline'} color={color} size={24}/>
            ),
        }}
      />
    </Tabs>
  );
}
