import { Alert } from "react-native";

/*
Update mood accepts values from 1 (awful) to 5 (excellent).
*/
export async function updateMood(patientId, moodValue) {
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
    });

    if (!response.ok) { // response.ok is true when HTTP status indicates success 
      throw new Error("Mood update failed"); // when this line is reached the rest of the try block is skipped
    }

    const data = await response.json(); // new row inserted in database
    console.log('Mood updated successfully:', data);
    Alert.alert('Mood logged', 'Your mood has been recorded successfully.'); // message for the user
    return true; // return true if mood was logged

    // shown on the UI 
  } catch (e) {
    console.error('Error updating mood:', e); // display error in terminal
    Alert.alert('Mood update failed', 'Please try again.');
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
