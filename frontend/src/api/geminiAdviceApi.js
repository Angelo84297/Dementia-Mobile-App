import { API_URL } from "../config/config";
import { setAbortController } from "../utils/setAbortController";

/**
 * Sends a post request to retrieve an AI wellbeing advice. 
 * If a response is not received within a minute the request is aborted.
 * 
 * @param {number} patientId - the ID of the patient.
 * @param {string} timezoneName - the local timezone name (e.g. Europe/London).
 * @returns {Promise<Object>} the AI wellbeing advice object containing content and time 
 * it was generated. 
 * @throws {Error} in case the request is not successful. 
 */
export async function geminiAdvice(patientId, timezoneName) {
    const { signal, clearTimer } = setAbortController(60000);  // set to 1 minute

    const response = await fetch(`${API_URL}/patients/${patientId}/wellbeingadvice/?timezone_name=${encodeURIComponent(timezoneName)}`,
        {
            method: 'POST',
            signal
        })

    clearTimer();

    if (!response.ok) {
        throw new Error("Gemini API call was not successful.");
    }

    const adviceData = await response.json();
    return adviceData
}
