import { useState, useEffect } from "react";
import { loadTaskList } from "../api/taskApi";
import { PATIENT_ID } from "../config/config";
import { syncNotifications } from "../services/notifications";

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

    useEffect(() => {
        refreshTasks();
    }, []);

    return { taskList, refreshTasks };
}
