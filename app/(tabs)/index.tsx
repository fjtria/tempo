import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNotifications } from "@/hooks/useNotifications";
import * as Notifications from 'expo-notifications';
import { Button, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const { scheduleNotificationAsync, cancelNotificationAsync } =
    useNotifications();

  const sendNotification = () => {
    scheduleNotificationAsync({
      content: {
        title: "🧪 Test notification!",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name='list.dash.header.rectangle'
          style={styles.headerImage}
        />
      }>

      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Dashboard</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Notifications Demo</ThemedText>
        <Button title="Send me a notification" onPress={sendNotification} />
        <Button title="Cancel notification" onPress={cancelNotificationAsync} />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Upcoming Reminders</ThemedText>
        <ThemedText>This will be the dashboard of the health app.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Collapsible title='Medications'>
        </Collapsible>
        <Collapsible title='Nutrition'>
        </Collapsible>
        <Collapsible title='Hydration'>
        </Collapsible>
        <Collapsible title='Cycle Tracking'>
        </Collapsible>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
