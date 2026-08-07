// helper function initializing an abort controller with a default timer of 3 seconds
// it returns the signal to automatically abort a fetch and the a function to clear the timer. 
export function setAbortController(timeout = 3000) {  // 3 seconds set by default

    const controller = new AbortController(); 
    const timeoutId = setTimeout(() => {
      controller.abort();  // cancels the requeest 
    }, timeout); 

    return {
        signal: controller.signal, 
        clearTimer : () => clearTimeout(timeoutId) // returned as a function as it's not triggered immediately
    }
}
  