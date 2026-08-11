import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './src/navigation/Tabs.js';
import { PATIENT_ID } from './src/screens/HomeScreen.js';
import { MenuProvider } from 'react-native-popup-menu';
import { syncNotifications, requestNotificationsPermissions, setNotificationsLocally } from './src/services/notifications.js';
import { loadTaskList } from './src/api/taskApi.js';
import * as Notifications from "expo-notifications";

export default function App() {

  async function setup() {
    try {
      await requestNotificationsPermissions();
      await syncNotifications();
      const notifications = await Notifications.getAllScheduledNotificationsAsync();

    } catch (error) {
      console.log(error);
    }
  }
  // run after the component is rendered. useEffect is used for side effects, in this case fetching data from API. 
  useEffect(() => {
    setup();
  }, []);  // [] makes use effect run once when the component is mounted as it tells React there are no values to keep track of for changes. 

  return (
    <MenuProvider>         {/* App is wrapped to use the Menu component */}
      // Manages app navigation state
      <NavigationContainer>
        {/* App's navigation structure*/}
        <Tabs />
      </NavigationContainer>
    </MenuProvider>
  )
}