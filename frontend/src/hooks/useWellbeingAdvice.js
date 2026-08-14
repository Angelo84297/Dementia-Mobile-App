import { useState, useEffect } from "react";
import { PATIENT_ID, timezone } from "../config/config";
import { geminiAdvice } from "../api/geminiAdviceApi";

/**
 * Manages the AI wellbeing advice and loading states. 
 * 
 * @returns {Object} An object containing the current AI wellbeing advice and 
 * a boolean signalling when the advice is loading. 
 */
export function useWellbeingAdvice() {

    const [wellbeingAdvice, setWellbeingAdvice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Loads the AI wellbeing advice and uploads the loading state. 
     */
    async function loadGeminiAdvice() {
        try {
            setIsLoading(true);

            const adviceData = await geminiAdvice(PATIENT_ID, timezone);
            setWellbeingAdvice(adviceData); 
        }
        catch (e) {
            console.log(e.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadGeminiAdvice();
    }, []);

    return { wellbeingAdvice, isLoading };

}