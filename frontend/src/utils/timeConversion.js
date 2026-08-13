
export function datetimeToTime(datetime) {
    const timeString = new Date(datetime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: false,
    })
    return timeString
}

    // convert minutes in a string showing hours and minutes.
    export function minutes_to_hours(total_min) {
        if (total_min == null) { 
            return null    // UI expects null to show "No records"
        } else {
            const hours = Math.floor(total_min / 60);
            const min = total_min % 60;
            return `${hours} h ${min} m`;
        }
    }

