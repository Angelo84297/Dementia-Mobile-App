import { API_URL } from "../config/config";
import { setAbortController } from "../utils/setAbortController";

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
