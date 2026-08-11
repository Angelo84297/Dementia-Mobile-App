import { useState, useEffect } from "react";
import { PATIENT_ID, timezone } from "../config/config";
import { geminiAdvice } from "../api/geminiAdviceApi";

export function useWellbeingAdvice() {

        const [wellbeingAdvice, setWellbeingAdvice] = useState(null);
        const [isLoading, setIsLoading] = useState(true); // loading Gemini advice


        useEffect(() => {
            loadGeminiAdvice();
        }, [])

        async function loadGeminiAdvice() {
            try {
                setIsLoading(true);

                const adviceData = await geminiAdvice(PATIENT_ID, timezone);

                setWellbeingAdvice(adviceData);  // update the advice string when data is received
            }
            catch (e) {
                console.log(e.message)
            } finally {
                setIsLoading(false)
            }
        }

        return { wellbeingAdvice, isLoading };

    }