import 'react-native-gesture-handler';
import React, { useEffect } from 'react'; 
import { NavigationContainer } from '@react-navigation/native';
import Tabs from './src/navigation/Tabs.js';
import { PATIENT_ID } from './src/screens/HomeScreen.js';
import * as Notifications from "expo-notifications";


Notifications.setNotificationHandler({   // needed to show notification
  handleNotification: async () => ({
    shouldShowBanner: true,   
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function requestNotificationsPermissions() {

  const permissions =await Notifications.requestPermissionsAsync();   // permission is needed from the user to set local notifcations on the smartphone
  if (permissions.status != "granted") {
    throw new Error("Notifications denied. Please try again"); 
  }
}

async function setNotificationsLocally(task) {

  const [hour, minute] = task.notification_time.split(":");   // split 09:30:00 in 09, 30 and 00 and assign 09 to hour and 30 to minute

  let trigger;  // let is used as it allows a value to be assigned later

  if (task.frequency === "daily") {
    trigger = {
      type: 'daily', 
          hour: Number(hour),   // conver str in int
          minute: Number(minute),
    }
  }

    if (task.frequency === "weekly") {
    trigger = {
      type: 'weekly', 
          hour: Number(hour),   // conver str in int
          minute: Number(minute),
          weekday: task.weekday
    }
  }


    const id= await Notifications.scheduleNotificationAsync({     
      content : {
        title : "Task reminder",   
        body : task.description,    // message for the user
        data: {
          taskId:task.task_id      // add task id to notification information. Can be useful when If in the future the task can be marked as completed from the notification
        }
      },
      trigger,
      
    })
    
}

  async function loadTaskList() {
    const response = await fetch (`http://192.168.1.65:8000/task/${PATIENT_ID}/`, {method: 'GET'})     

    if (!response.ok) {
      throw new Error("Task list could not be fetched from the server")
    }

    const data = await response.json();
    return data; 
  }

  async function syncNotifications(tasks) {       // needs to be called when a new task is added  or deleted in the database

    for (const task of tasks) {      // add each task in the task list to the local notifications
      await setNotificationsLocally(task);
    }

  }



export default function App() {

  async function setup() {
    try {
      await requestNotificationsPermissions(); 

      const tasks = await loadTaskList();   // fetch tasks from database
      await Notifications.cancelAllScheduledNotificationsAsync();   // existing notifications are cancelled only when a new list of tasks are successfully fetched. 
      // This ensures the local notifications match the tasks in the database. 
      await syncNotifications(tasks);    
      
      const notifications = await Notifications.getAllScheduledNotificationsAsync();

      console.log("Scheduled notifications:", notifications);


    } catch(error) {

      console.log(error);    
    }
  }
    // run after the component is rendered. useEffect is used for side effects, in this case fetching data from API. 
    useEffect(() => {   
    setup();
  }, []);  // [] makes use effect run once when the component is mounted as it tells React there are no values to keep track of for changes. 


  return (
    // Manages app navigation state
    <NavigationContainer>
      {/* App's navigation structure*/}
      <Tabs />  
    </NavigationContainer>
  )

}