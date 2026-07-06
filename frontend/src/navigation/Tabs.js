import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import screens to be opened by bottom nav bar
import HomeScreen from '../screens/HomeScreen';
import HealthScreen from '../screens/HealthScreen';

// Create bottom navigation bar
const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>  
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Health" component={HealthScreen} />
    </Tab.Navigator>
  );
}
