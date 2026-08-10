import { useState, useEffect } from "react";
import { getTodayMood, updateMood } from "../api/moodApi";
import { PATIENT_ID, timezone } from "../screens/HomeScreen";
import { API_URL } from "../config/apiConfig.js";


export function useMood() {

  const [moodList, setMoodList] = useState([]);
  // keeps hook separate from API
  const loadMoodList = async () => {
    try {
      const data = await getTodayMood(PATIENT_ID, timezone);
      setMoodList(data);
    } catch (error) {
      console.error(error);
    }
  };

  const recordMood = async (moodValue) => {
    const success = await updateMood(PATIENT_ID, moodValue); // waits for server response
    
    if (success) {
      loadMoodList(); // refresh UI with new mood
    }
    return success 
  };

  // load the mood list when the component is displayed on the screen
  useEffect(() => {
    loadMoodList();
  }, []);

  return {
    moodList,
    recordMood
  };
}
