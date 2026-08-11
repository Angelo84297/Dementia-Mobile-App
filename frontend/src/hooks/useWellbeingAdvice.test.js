import { useWellbeingAdvice } from "./useWellbeingAdvice";
import { renderHook, waitFor } from "@testing-library/react-native"
import { geminiAdvice } from "../api/geminiAdviceApi";
import { PATIENT_ID, timezone } from "../config/config";

jest.mock('../api/geminiAdviceApi', () => ({
    geminiAdvice: jest.fn(),
}));

beforeEach(() => {
    jest.clearAllMocks();
    geminiAdvice.mockResolvedValue({
        content: "Hi I'm your supportive companion",
        created_at: "2026-08-11T09:00:00Z"
    });
});

test("is Loading is set on true while waiting for the Gemini response", async () => {
    // simulate pending request 
    geminiAdvice.mockResolvedValue(new Promise (() => {})); 

    const { result } = renderHook(() => useWellbeingAdvice());

    await waitFor (() => {
        expect(result.current.isLoading).toBe(true);
    })
    
})

test("isLoading is set to false when the Gemini response is loaded", async () => {
    const { result } = renderHook(() => useWellbeingAdvice());

    await waitFor (() => {
        expect(result.current.isLoading).toBe(false);
    })
})

test("Loads and returns the wellbeing Advice, after correctly passing patient id and timezone", async () => {

    const { result } = renderHook(() => useWellbeingAdvice());

    await waitFor(() => {
        expect(result.current.wellbeingAdvice).toEqual({
            content: "Hi I'm your supportive companion",
            created_at: "2026-08-11T09:00:00Z"
        });
    });
    expect(geminiAdvice).toHaveBeenCalledWith(PATIENT_ID, timezone); 

});



