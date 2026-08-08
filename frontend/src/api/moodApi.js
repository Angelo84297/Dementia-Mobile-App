import { Alert } from "react-native";
import { setAbortController } from "../utils/setAbortController";

/*
Update mood accepts values from 1 (awful) to 5 (excellent).
*/
export async function updateMood(patientId, moodValue) {
  const { signal, clearTimer } = setAbortController();

  try {
    const response = await fetch('http://192.168.1.65:8000/mood/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        patient_id: patientId,
        mood: moodValue,
      }),
      signal
    });

    clearTimer();  // cleared as no longer needed
    if (!response.ok) {
      throw new Error(`Mood update failed: (${response.status})`);
    }
    const data = await response.json();
    console.log('Mood updated successfully:', data);
    Alert.alert('Mood logged', 'Your mood has been recorded successfully.'); // message for the user
    return true; // if mood was logged

    // shown on the UI 
  } catch (e) {
    console.error('Error updating mood:', e); // display error in terminal
    Alert.alert('Mood update failed', 'Please try again later.');
    return false;
  }
}

export async function getTodayMood(patientId, timezoneName) {
  const response = await fetch(
    `http://192.168.1.65:8000/mood/${patientId}/today?timezone_name=${encodeURIComponent(timezoneName)}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error('Could not fetch mood list');
  }

  return response.json();
}
