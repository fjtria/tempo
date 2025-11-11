import { Link, Stack } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ 
        title: 'Redirect',
        headerShown: false
      }} 
      />
      <View style={styles.container}>
        <Image style={styles.logo} source={require('../assets/images/tempo-logo.png')} />
        <Link href="(tabs)" style={styles.button}>
          Enter Dashboard
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 20, // (Optional) Add some spacing
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5F0F6',
    backgroundColor: '#6C4386',
    borderRadius: 16
  },
});
