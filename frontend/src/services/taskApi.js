import { PATIENT_ID } from '../screens/HomeScreen';

export async function loadTaskList() {
  const response = await fetch(`http://192.168.1.65:8000/task/${PATIENT_ID}/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Task list could not be fetched from the server');
  }

  return response.json();
}
