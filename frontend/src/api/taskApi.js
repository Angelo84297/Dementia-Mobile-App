import { API_URL } from '../config/config';
import { setAbortController } from '../utils/setAbortController';

export async function loadTaskList(patientId) {
  const response = await fetch(`${API_URL}/task/${patientId}/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Task list could not be fetched from the server');
  }

  return response.json();
}

export async function deleteTask(patientId, taskId) {
    const { signal, clearTimer } = setAbortController();

    try {
        const response = await fetch(`${API_URL}/patients/${patientId}/tasks/${taskId}`, {
            method: 'DELETE',
            signal
        });

      if (!response.ok) { // response.ok is true when HTTP status indicates success 
          throw new Error("Task could not be deleted");
      }
      
    } finally {
      clearTimer();
    
}
}
