/**
 * Initializes an AbortController with a default timer of 3 seconds.
 * 
 * @param {integer} timeout time the execution is aborted in milliseconds.
 * @returns {Object} An object containing the signal to abort execution and a function 
 * to clear the timer when no longer needed. 
 */
export function setAbortController(timeout = 3000) {  // 3 seconds set by default

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();  
    }, timeout);

    return {
        signal: controller.signal,
        clearTimer: () => clearTimeout(timeoutId) 
    }
}
