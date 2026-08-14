import { API_URL } from '../config/config';
import { setAbortController } from '../utils/setAbortController';

/**
 * Sends a get request to retrieve the user's daily tasks. 
 * 
 * @param {number} patientId - the ID of the patient. 
 * @returns {Promise<Object[]>} the list of task objects. Each task object 
 * contains task id, description, notification time, frequency and weekday. 
 * @throws {Error} in case the request is not successful. 
 */
export async function loadTaskList(patientId) {
  const response = await fetch(`${API_URL}/task/${patientId}/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Task list could not be fetched from the server');
  }

  return response.json();
}

/**
 * Sends a delete request to remove a task from the user's task list. 
 * If a response is not received within 3 seconds execution is aborted. 
 * 
 * @param {number} patientId - the ID of the patient. 
 * @param {number} taskId - the ID of the task.  
 * @throws {Error} in case the request is not successful. 
 */
export async function deleteTask(patientId, taskId) {
    const { signal, clearTimer } = setAbortController();

    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/tasks/${taskId}`, {
            method: 'DELETE',
            signal
        });

      if (!response.ok) { 
          throw new Error("Task could not be deleted");
      }
      
    } finally {
      clearTimer();
    }
}

/**
 * Sends a post request to log a new task for the user. 
 * If a response is not received within 3 seconds executions is aborted. 
 * 
 * @param {number} patientId - the ID of the patient.
 * @param {string} description - the task description.
 * @param {Date} notificationTime - the time selected by the user. Date gives timezone information for conversion. 
 * @param {string} frequency - the task frequency (daily/weekly).
 * @param {number} weekday - the day the task is sheduled (only for weekly frequencies).
 * @throws {Error} in case logging the task fails. 
 */
export async function logTask(patientId, description, notificationTime, frequency, weekday) {
    const { signal, clearTimer } = setAbortController();

    const response = await fetch(`${API_URL}/task/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            patient_id: patientId,
            description: description,
            notification_time: notificationTime,
            frequency: frequency,
            weekday: weekday
        }),
        signal
    });

    clearTimer();
    if (!response.ok) { 
        throw new Error(`Task log failed, ${response.status}`);
    }

}
