import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SessionLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="light" />
      {/* This View acts as the background for the status bar */}
      <View style={{ height: insets.top, backgroundColor: '#121212' }} />
      <Stack
        screenOptions={{
          headerShown: false,
          // Changed to 'card' for better stability on modals
          presentation: 'card', 
          contentStyle: {
            backgroundColor: '#121212',
          },
        }}
      />
    </>
  );
}
