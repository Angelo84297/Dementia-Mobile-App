import { updateMood, getTodayMood } from "../api/moodApi";
import { waitFor } from "@testing-library/react-native";

// mocks network request 
global.fetch = jest.fn();

// to fix undefined API_URL 
jest.mock("../config/config", () => ({
    API_URL: "",
    PATIENT_ID: 1,
  timezone: "Europe/London"

}));

// mocks server response
test("updateMood sends fetch POST request correctly and returns true", async () => {
    fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({}) // {} used since response is not important
    });

    const result = await updateMood(1, 4);

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/mood/`), // testing if correct endpoint is called
        expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
                patient_id: 1,   // currently hardcoded 
                mood: 4
            })
        })
    );

    expect(result).toBe(true); // since updateMood returns true in case of success
})

test("updateMood returns false when in case of error and an error is logged", async () => {
    const consoleSpy = jest 
        .spyOn(console, "error")
        .mockImplementation(() => {}); // avoids the error to be displayed in jest output

    fetch.mockResolvedValue({
        ok: false,
        status: 404 
    });

    const result = await updateMood(1, 4);

    expect(result).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith(
        'Error updating mood:',
        expect.any(Error)
    )
    consoleSpy.mockRestore(); 
})


test("getTodayMood calls fetch with correct patient ID  and timezone", async () => {
    fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue([])
    })

    await getTodayMood(1, "Europe/London");  

    expect(fetch).toHaveBeenCalledWith(
        `/mood/1/today?timezone_name=Europe%2FLondon`,
        { method: "GET" }
    );
});

test("getTodayMood returns data when API call is successful", async () => {

    moodList = [
        { "created_at": "2026-08-09T10:20:49Z", "mood": 4, "mood_id": 1 },
        { "created_at": "2026-08-09T10:30:49Z", "mood": 5, "mood_id": 2 }
    ]
    
    fetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(moodList)
    })

    const result = await getTodayMood(1, "Europe/London");

    expect(result).toEqual(moodList)
})

test("getTodayMood throws error when API call is unsuccessful", async () => {

    fetch.mockResolvedValue({
        ok: false,
    })

    await expect(getTodayMood(1, "Europe/London")
        ).rejects.toThrow("Could not fetch mood list");

});