import { API_URL } from "../config/config";

/**
 * Sends a get request to the backend to retrieve the daily health records. 
 * 
 * @param {number} patientId - the ID of the patient. 
 * @param {String} timezoneName - the local timezone name (e.g. Europe\London). 
 * @returns {Promise<Object>} the current daily health record object containing 
 * total step count, average heartbeat and sleep time.
 * @throws {Error} in case the request is not successful. 
 */

export async function getTodayHealthSummary(patientId, timezoneName) {

    const response = await fetch(
        `${API_URL}/healthsummary/${patientId}/today?timezone_name=${encodeURIComponent(timezoneName)}`,
        { method: 'GET' }
    );

    if (!response.ok) {
        throw new Error("Could not fetch Health Record");
    }

    return response.json()

}
