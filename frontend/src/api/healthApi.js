import { API_URL } from "../config/config";

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
