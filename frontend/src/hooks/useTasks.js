import { useState, useEffect } from "react";
import { loadTaskList, deleteTask } from "../api/taskApi";
import { PATIENT_ID } from "../config/config";
import { syncNotifications } from "../services/notifications";

/**
 * Loads and manages the state of the task list and keeps local notifications 
 * synchronised with it. 
 * 
 * @returns {Object} An object containing the current task list, 
 * a function to refresh the tasks, a function to remove a task. 
 */
export function useTasks() {

    const [taskList, setTaskList] = useState([]);

    /**
     * Loads the task list, updates its state and updates the local 
     * notifications to match the current tasks. 
     */
    async function refreshTasks() {
        try {
            const taskData = await loadTaskList(PATIENT_ID);
            setTaskList(taskData);
            await syncNotifications();
        } catch (error) {
            console.error(error);
        }
    }
    /**
     * Removes a task and refreshes the task list. 
     * 
     * @param {number} taskId - ID of the task to remove.
     */
    async function removeTask(taskId) {    
        await deleteTask(PATIENT_ID, taskId);  // error not catched so it can reach the UI
        await refreshTasks(); 
    }

    useEffect(() => {
        refreshTasks();
    }, []);

    return { taskList, refreshTasks, removeTask }

}


