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

/**
 * Loads the task list and sets a local notification for each task. 
 */
export async function syncNotifications() {       
  try {
    const tasks = await loadTaskList(PATIENT_ID);   
    await Notifications.cancelAllScheduledNotificationsAsync();   // after the list is fetched to avoid deleting notifications if tasks cannot be fetched. 
    for (const task of tasks) {     
      await setNotificationsLocally(task);
    }
  } catch (e) {
    throw new Error(`Notification synchronisation failed: ${e.message}`); 
  }
}

/**
 * Requests permissions to set local notifications. 
 */
export async function requestNotificationsPermissions() {

  const permissions = await Notifications.requestPermissionsAsync();   
  if (permissions.status != "granted") {
    throw new Error("Notifications denied. Please try again");
  }
}

/**
 * Sets a local notification for a task. The notification can 
 * be triggered daily or weekly. 
 * 
 * @param {Object} task The task object providing notification time, 
 * frequency (daily/weekly), description, weekday (for weekly tasks), 
 * task id 
 */
export async function setNotificationsLocally(task) {
  const date = new Date(task.notification_time);  // datetime allows local time conversion
  const hour = date.getHours();
  const minute = date.getMinutes();

  let trigger; 

  if (task.frequency === "daily") {
    trigger = {
      type: 'daily',
      hour: Number(hour),   // convert from string
      minute: Number(minute)
    }
  }

  if (task.frequency === "weekly") {
    trigger = {
      type: 'weekly',
      hour: Number(hour),   
      minute: Number(minute),
      weekday: task.weekday
    }
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Task reminder",
      body: task.description,   // reminder for the user
      data: {
        taskId: task.task_id      // can be useful for future functionalities (e.g. deleting only one notificaiton at a time). 
      }
    },
    trigger,

  })

}
