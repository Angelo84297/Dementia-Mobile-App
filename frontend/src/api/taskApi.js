import { API_URL } from '../config/config';

export async function loadTaskList(patientId) {
  const response = await fetch(`${API_URL}/task/${patientId}/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Task list could not be fetched from the server');
  }

  return response.json();
}
