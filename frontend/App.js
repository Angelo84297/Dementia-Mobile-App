import 'react-native-gesture-handler';
import React from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './src/navigation/Tabs.js';

export default function App() {
  return (
    // Manages app navigation state
    <NavigationContainer>
      {/* App's navigation structure*/}
      <Tabs />  
    </NavigationContainer>
  )
}