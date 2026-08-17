import { useState, useEffect } from "react";
import { getTodayMood, updateMood } from "../api/moodApi";
import { timezone } from '../config/config.js';
import { PATIENT_ID } from '../config/config.js';

/**
 * Manages the mood list state and provides a function to record mood values. 
 * 
 * @returns {Object} An object containing:
 * -The current list of mood objects. Each mood object contains
 * mood value, the time the mood was logged, and mood id. 
 * -A function to record a new mood. 
 */
export function useMood() {

  const [moodList, setMoodList] = useState([]);
  /**
   * Loads and manages the state of the mood list. 
   */
  const loadMoodList = async () => {
    try {
      const data = await getTodayMood(PATIENT_ID, timezone);
      setMoodList(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMoodList();
  }, []);

  /**
   * Records a mood value and refreshes the mood list in case of success. 
   * 
   * @param {number} moodValue the mood value to record from 1 (Awful) to 5 (Super). 
   * @returns {Promise<boolean>} Resolves to true when mood is logged successfully.
   */
  const recordMood = async (moodValue) => {
    const success = await updateMood(PATIENT_ID, moodValue);

    if (success) {
      await loadMoodList(); // refresh UI 
    };
    return success
  }

  return {
    moodList,
    recordMood
  };
}
