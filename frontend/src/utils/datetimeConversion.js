
export function datetimeToTime(datetime) {
    const timeString = new Date(datetime).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })
    return timeString
}
