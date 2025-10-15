import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NutritionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nutrition screen</Text>
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
  text: {
    color: '#020202',
  },
});
