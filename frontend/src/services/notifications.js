import * as Notifications from "expo-notifications";
import { loadTaskList } from "../api/taskApi";
import { convertDatetime } from "../utils/timeConversion";
import { PATIENT_ID } from "../config/config";

Notifications.setNotificationHandler({   // needed to show notification
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function syncNotifications() {       // needs to be called when a new task is added  or deleted in the database
  const tasks = await loadTaskList(PATIENT_ID);   // fetch tasks from database
  await Notifications.cancelAllScheduledNotificationsAsync();   // existing notifications are cancelled only when a new list of tasks are successfully fetched. 
  // This ensures the local notifications match the tasks in the database. 
  for (const task of tasks) {      // add each task in the task list to the local notifications
    await setNotificationsLocally(task);
  }
  //use for debugging 
  //const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  //console.log("Scheduled notifications", scheduled); 
}

export async function requestNotificationsPermissions() {

  const permissions = await Notifications.requestPermissionsAsync();   // permission to set local notifcations
  if (permissions.status != "granted") {
    throw new Error("Notifications denied. Please try again");
  }
}

export async function setNotificationsLocally(task) {

  const date = new Date(task.notification_time);  // datetime allows local time conversion
  const hour = date.getHours();
  const minute = date.getMinutes();

  let trigger;  // allows a value to be assigned later

  if (task.frequency === "daily") {
    trigger = {
      type: 'daily',
      hour: Number(hour),   // conver str in int
      minute: Number(minute)
    }
  }

  if (task.frequency === "weekly") {
    trigger = {
      type: 'weekly',
      hour: Number(hour),   // convert from string
      minute: Number(minute),
      weekday: task.weekday
    }
  }


  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Task reminder",
      body: task.description,    // message for the user
      data: {
        taskId: task.task_id      // add task id to notification information. Can be useful when If in the future the task can be marked as completed from the notification
      }
    },
    trigger,

  })

}
