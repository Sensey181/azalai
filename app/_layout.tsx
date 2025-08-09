import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

// This is the custom component for the central button
const ChatbotButton = ({ focused }: { focused: boolean }) => (
  <View
    style={{
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#A020F0',
      justifyContent: 'center',
      alignItems: 'center',
      // This lifts the button up
      transform: [{ translateY: -25 }],
      // Shadow for depth
      shadowColor: '#A020F0',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
      elevation: 10,
    }}
  >
    <Ionicons
      name="chatbubbles-outline"
      size={40}
      color={focused ? '#fff' : '#eee'}
    />
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // We hide labels to keep it clean with the central button
        tabBarStyle: {
          backgroundColor: '#1e1e1e',
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
        },
        tabBarActiveTintColor: '#A020F0',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen
        name="index" // Training
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="planning" // Plan
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot" // The middle button
        options={{
          tabBarIcon: ({ focused }) => <ChatbotButton focused={focused} />,
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent navigating to the placeholder screen
            e.preventDefault();
            // This is where you'll trigger the AI agent later
            console.log('Chatbot button pressed!');
          },
        }}
      />
      <Tabs.Screen
        name="achievements" // Achievements
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis" // Analysis
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="videocam-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}