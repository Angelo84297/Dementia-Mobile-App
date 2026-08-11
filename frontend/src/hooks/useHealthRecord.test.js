import { getTodayHealthSummary } from "../api/healthApi";
import { PATIENT_ID, timezone } from "../config/config";
import { useHealthRecord } from "./useHealthRecord";
import { renderHook, waitFor } from "@testing-library/react-native";

jest.mock('../api/healthApi', () => ({
    getTodayHealthSummary: jest.fn(),
}));


beforeEach(() => {
    jest.clearAllMocks();
    getTodayHealthSummary.mockResolvedValue({
        max_sleep_minutes: 390,  
        average_heart_rate: 70,
        total_step_count: 6000
    });
});

test("Loads and returns the daily health record, after correctly passing patient id and timezone", async () => {

    const { result } = renderHook(() => useHealthRecord());

    await waitFor(() => {
        expect(result.current).toEqual(
            {
                max_sleep_minutes: 390,   
                average_heart_rate: 70,
                total_step_count: 6000
            }
        );
    });
    expect(getTodayHealthSummary).toHaveBeenCalledWith(PATIENT_ID, timezone); 

});

test("Returns null when no health record is received ", async () => {
    
    getTodayHealthSummary.mockResolvedValue(null);
    const { result } = renderHook(() => useHealthRecord());
        await waitFor(() => {
        expect(result.current).toEqual(null);
    });

})