import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SessionLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#121212" />
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'modal',
          contentStyle: {
            backgroundColor: '#121212',
          },
        }}
      />
    </>
  );
}
