import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens to be opened by bottom nav bar
import HomeScreen from '../screens/HomeScreen';
import HealthScreen from '../screens/HealthScreen';
import TasksScreen from '../screens/TasksScreen';

// Create bottom navigation bar
const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarInactiveTintColor: 'black',
      tabBarActiveTintColor: '#6200ee',  // bright color indicates which is the viewed page
      tabBarStyle: {
        height: 85
      },
      tabBarLabelStyle: {
        fontSize: 14,
      }
    }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="home"
              color={color}   // use color given by navigator
              size={30}
            />
          )
        }}
      />
      <Tab.Screen
        name="Health"
        component={HealthScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="heart-pulse"
              color={color}
              size={30}
            />
          )
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="checkbox-marked-outline"
              color={color}
              size={30}
            />
          )
        }}
      />
    </Tab.Navigator>
  );
}
