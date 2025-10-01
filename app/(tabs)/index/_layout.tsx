import { Stack } from 'expo-router';
import React from 'react';

export default function DashboardStackLayout() {
  return (
    <Stack>
        <Stack.Screen 
            name="dashboard" 
            options={{ 
                title: 'Dashboard',
                headerShown: true,
                headerStyle: {
                backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
            }} 
        />
        <Stack.Screen
            name="medications"
            options={{
                title: 'Medications',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
            }}
        />
        <Stack.Screen
            name="nutrition"
            options={{
                title: 'Nutrition',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
            }}
        />
        <Stack.Screen
            name="hydration"
            options={{
                title: 'Hydration',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
            }} 
        />
        <Stack.Screen
            name="cycleTracking"
            options={{ 
                title: 'Cycle Tracking',
                headerStyle: {
                    backgroundColor: '#25292e',
                },
                headerShadowVisible: false,
                headerTintColor: '#fff',
            }}
            />
    </Stack>
  );
}