import { setAbortController } from "../utils/setAbortController";
import { API_URL } from "../config/config.js";

/**
 * Sends a post request to the backend for logging a new mood value. 
 * If a response is not received within 3 seconds the request is aborted. 
 * 
 * @param {number} patientId - the ID of the patient. 
 * @param {number} moodValue - the mood value to post from 1 (Awful) to 5 (Super). 
 * @returns {Promise<boolean>} signals if the request is successful. 
 * @throws {Error} in case the request is not successful.  
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
    return true; 

  } catch (e) {
    console.error('Error updating mood:', e); 
    return false; // for the HomeScreen to display Alert
  }
}

/**
 * Sends a get request to retrieve the patient's daily mood list.
 * 
 * @param {integer} patientId - the ID of the patient. 
 * @param {string} timezoneName - the local timezone name (e.g. Europe\London). 
 * @returns {Promise<Object[]>} A list of mood objects. Each mood object contains
 * mood value, the time the mood was logged, and mood id. 
 * @throws {Error} in case the API request fails. 
 */
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
