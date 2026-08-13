import { useState, useEffect } from "react";
import { loadTaskList } from "../api/taskApi";
import { PATIENT_ID } from "../config/config";
import { syncNotifications } from "../services/notifications";
import { deleteTask } from "../api/taskApi";

export function useTasks() {

    const [taskList, setTaskList] = useState([]);

    async function refreshTasks() {
        try {
            const taskData = await loadTaskList(PATIENT_ID);
            setTaskList(taskData);
            await syncNotifications(); // update notifications depending on tasks
        } catch (error) {
            console.error(error);
        }
    }

    async function removeTask(taskId) {    // if an item is successfully deleted dispay the current task list
        await deleteTask(PATIENT_ID, taskId);
        await refreshTasks();
    }

    useEffect(() => {
        refreshTasks();
    }, []);

    return { taskList, refreshTasks, removeTask }

}


