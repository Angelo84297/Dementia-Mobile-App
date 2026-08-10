import { getTodayMood, updateMood } from "../api/moodApi";
import { useMood } from "../hooks/useMood";
import { renderHook, waitFor } from "@testing-library/react-native"

jest.mock('../api/moodApi', () => ({
    getTodayMood: jest.fn(),
    updateMood: jest.fn()
}));

beforeEach(() => {
  jest.clearAllMocks();
  getTodayMood.mockResolvedValue([]);
});

test("Initializes empty mood list" , async () => {

    const { result } = renderHook(() => useMood());

    await waitFor(() => {
        expect(result.current.moodList).toEqual([]);
    });
})

