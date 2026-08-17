import { getTodayMood, updateMood } from "../api/moodApi";
import { useMood } from "../hooks/useMood";
import { renderHook, waitFor, act } from "@testing-library/react-native"

jest.mock('../api/moodApi', () => ({
    getTodayMood: jest.fn(),
    updateMood: jest.fn()
}));

beforeEach(() => {
    jest.clearAllMocks();
    getTodayMood.mockResolvedValue([]); // return empty list by default
});

test("Loads today's mood list with no mood items ", async () => {  // async because of the API call

    const { result } = renderHook(() => useMood());

    await waitFor(() => {
        expect(result.current.moodList).toEqual([]);
    });

})

test("Loads today's mood list with one mood", async () => {

    getTodayMood.mockResolvedValue([
        { "created_at": "2026-08-09T10:20:49Z", "mood": 4, "mood_id": 1 },
    ]);

    const { result } = renderHook(() => useMood());

    await waitFor(() => {
        expect(result.current.moodList).toEqual([
            { "created_at": "2026-08-09T10:20:49Z", "mood": 4, "mood_id": 1 }
        ]);
    });
})

test("recordMood calls updateMood with the correct values and refreshes mood list", async () => {
    updateMood.mockResolvedValue(true); // resolves API promise to true

    getTodayMood
    .mockResolvedValueOnce([])  // before a new mood is added
    .mockResolvedValueOnce([   
        { "created_at": "2026-08-09T10:20:49Z", "mood": 4, "mood_id": 1 }  // after mood is logged
    ])

    const { result } = renderHook(() => useMood());

    await waitFor(() => {
        expect(result.current.moodList).toEqual([]); 
    })

    await act(async () => {  // act used as the state updates
        await result.current.recordMood(4);
    });

    expect(updateMood).toHaveBeenCalledWith(1, 4); // patient id and mood value
    // called at the beginning and after recordMood 
    expect(getTodayMood).toHaveBeenCalledTimes(2);
    
    // moodList after refresh
    await waitFor(() => {
        expect(result.current.moodList).toEqual([
            { "created_at": "2026-08-09T10:20:49Z", "mood": 4, "mood_id": 1 }
        ])
    })

})

