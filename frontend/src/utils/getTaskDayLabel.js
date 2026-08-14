/**
 * Returns a label indicating when a task is scheduled. 
 * 
 * @param {string} frequency - the task's frequency (daily/weekly).
 * @param {number} day - the day the task is scheduled.
 * @returns {string} "Today" when the task is set for the current day
 * or the corresponding weekday. 
 */
export function getTaskDayLabel(frequency, day) {

    if (frequency === 'daily') {
        return 'Today';
    }

    const today = new Date().getDay() + 1; // with getDay() Sunday = 0, in the backend Sunday = 1 

    if (frequency === 'weekly' && day === today) {
        return 'Today';
    }

    const weekdays = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    return weekdays[day - 1];
}
