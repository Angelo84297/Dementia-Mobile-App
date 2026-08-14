import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './src/navigation/Tabs.js';
import { MenuProvider } from 'react-native-popup-menu';
import { syncNotifications, requestNotificationsPermissions } from './src/services/notifications.js';
import * as Notifications from "expo-notifications";

/**
 * The application's root component.  
 * 
 * On start-up sets up notification permissions and synchronises local notifications
 * with database. 
 */
export default function App() {

  /**
   * Requests notification permissions when the application is started 
   * and synchronises local notifications with tasks in task list. 
   */
  async function setup() {
    try {
      await requestNotificationsPermissions();
      await syncNotifications();

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    setup();  
  }, []);  // setup only needs to run when the component is mounted. 

  return (
    <MenuProvider>   {/* App is wrapped to use the Menu component in AddTasksScreen*/}
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </MenuProvider>
  )
}