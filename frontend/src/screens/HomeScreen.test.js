import { fireEvent, render, screen, within } from "@testing-library/react-native";
import HomeScreen from "./HomeScreen";
import { useMood } from '../hooks/useMood';

jest.mock("../hooks/useMood", () => ({
  useMood: jest.fn()
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: () => null,  // avoids loading icons as it doesn't need to be tested
}));

const mockRecordMood = jest.fn()

// before each test the hook returns an empty moodList
beforeEach(() => {
  jest.clearAllMocks();

  useMood.mockReturnValue({ 
    moodList: [], 
    recordMood: mockRecordMood });
});

test("Renders greeting", () => {
  render(<HomeScreen />);  
  expect(screen.getByText("Good Morning, Madison!")).toBeTruthy();
  expect(screen.getByText("How are you feeling today?")).toBeTruthy();
});

test("Today's mood doesn't appear when the mood list is empty", () => {
  render(<HomeScreen />);
  expect(screen.queryByText("Today's Mood")).not.toBeTruthy();
});

test("Today's mood appears when there is at least a mood in the moodList", () => {
    useMood.mockReturnValue({
    moodList: [
      { "created_at": "2026-08-09T10:20:49Z", "mood": 4, "mood_id": 1 },  
    ],
    recordMood: mockRecordMood
  });
  render(<HomeScreen />);
  expect(screen.queryByText("Today's Mood")).toBeTruthy();
})


test("Renders all the mood buttons", () => {
  render(<HomeScreen />)
  expect(screen.getByText("Super")).toBeTruthy();
  expect(screen.getByText("Good")).toBeTruthy();
  expect(screen.getByText("Fair")).toBeTruthy();
  expect(screen.getByText("Bad")).toBeTruthy();
  expect(screen.getByText("Awful")).toBeTruthy();
})

test("Pressing mood button calls recordMood", () => {
  render(<HomeScreen />)
  fireEvent.press(screen.getByText("Good"));

  expect(mockRecordMood).toHaveBeenCalledWith(4); // mood value

})

test("Moods in the moodList are displayed correctly", () => {
  useMood.mockReturnValue({
    moodList: [
      { "created_at": "2026-08-09T10:20:49Z", "mood": 4, "mood_id": 1 },  // assuming 2026-08-09 is the current day
      { "created_at": "2026-08-09T16:18:08Z", "mood": 1, "mood_id": 2 }
    ],
    recordMood: mockRecordMood
  });
  
  render(<HomeScreen />)
  // TestId is needeed to ensure the rendered mood matches the one in the moodList
  const moodCard = screen.getByTestId("todayMood-1")
  const moodCard2 = screen.getByTestId("todayMood-2")
  expect(within(moodCard).getByText("Good")).toBeTruthy();
  expect(within(moodCard).getByText("11:20 am")).toBeTruthy();  // assumes the tester's timezone is utc + 1
  expect(within(moodCard2).getByText("Awful"));
})


