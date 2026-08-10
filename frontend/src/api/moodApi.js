import { setAbortController } from "../utils/setAbortController";
import { API_URL } from "../config/apiConfig.js";

/*
Update mood accepts values from 1 (awful) to 5 (excellent).
*/
export async function updateMood(patientId, moodValue) {
  const { signal, clearTimer } = setAbortController();

  try {
    const response = await fetch(`${API_URL}/mood/`, {
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
    
    return true; // if mood was logged

    // shown on the UI 
  } catch (e) {
    console.error('Error updating mood:', e); // display error in terminal
    
    return false;
  }
}

export async function getTodayMood(patientId, timezoneName) {

  const response = await fetch(
    `${API_URL}/mood/${patientId}/today?timezone_name=${encodeURIComponent(timezoneName)}`,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error('Could not fetch mood list');
  }

  return response.json();
}
