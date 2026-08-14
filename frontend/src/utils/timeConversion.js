/**
 * Formats a date/time string as a local time string. 
 * 
 * @param {string} datetime the date/time to format. 
 * @returns {string} the formatted time using the 24-hour notation. 
 */
export function datetimeToTime(datetime) {
    const timeString = new Date(datetime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    })
    return timeString
}

/**
 * Converts minutes into a string showing corresponding hours 
 * and minutes. 
 * 
 * @param {number|null} totalMin - the total minutes to be converted. 
 * @returns {string|null} the formatted string displaying hours and minutes or 
 * null if no value is given. 
 */
export function minutesToHours(totalMin) {
    if (totalMin == null) {
        return null  // UI expects null to show "No records"
    } else {
        const hours = Math.floor(totalMin / 60);
        const min = totalMin % 60;
        return `${hours} h ${min} m`;
    }
}

