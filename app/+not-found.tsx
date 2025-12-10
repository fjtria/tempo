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
    marginBottom: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F5F0F6',
    backgroundColor: '#6C4386',
    borderRadius: 24
  },
});
