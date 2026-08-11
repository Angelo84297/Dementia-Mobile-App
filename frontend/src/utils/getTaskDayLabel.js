
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
