import { fireEvent, render, waitFor, screen, within } from "@testing-library/react-native";
import renderer, { act } from "react-test-renderer";
import { Alert } from 'react-native';
import HomeScreen from "./HomeScreen";
import { updateMood, getTodayMood } from "../api/moodApi";

// mock functions replacing API calls
jest.mock("../api/moodApi", () => ({
  updateMood: jest.fn(),
  getTodayMood: jest.fn(),
}));

// before each test reset all the mock functions
beforeEach(() => {
  jest.clearAllMocks();
  getTodayMood.mockResolvedValue([]); // empty mood list 
});


test("Renders greeting", async () => {
  await render(<HomeScreen />);  // render is asynchronous
  expect(screen.findByText("Good Morning, Madison!")).toBeTruthy();
  expect(screen.findByText("How are you feeling today?")).toBeTruthy();
});

test("Today's mood doesn't appear when the mood list is empty", async () => {
  await render(<HomeScreen />);
  expect(screen.queryByText("Today's Mood")).not.toBeTruthy();
});


test("Renders all the mood buttons", async () => {
  await render(<HomeScreen />)
  expect(screen.getByText("Super")).toBeTruthy();
  expect(screen.getByText("Good")).toBeTruthy();
  expect(screen.getByText("Fair")).toBeTruthy();
  expect(screen.getByText("Bad")).toBeTruthy();
  expect(screen.getByText("Awful")).toBeTruthy();
})

test("Pressing mood button calls updateMood with the expected data and refreshes the mood list", async () => {
  updateMood.mockResolvedValue(true);
  await render(<HomeScreen />)

  await act(async () => { // fire events updating state need to be wrapped in act 
    fireEvent.press(screen.getByText("Good"));
  })

  expect(updateMood).toHaveBeenCalledWith(1, 4); // patient id and mood value
  expect(getTodayMood).toHaveBeenCalled();
  ;
})

test("Today's moods are displayed correctly", async () => {
  getTodayMood.mockResolvedValue(
    [
      { "created_at": "2026-08-09T10:20:49Z", "mood": 4, "mood_id": 1 },
      { "created_at": "2026-08-09T16:18:08Z", "mood": 1, "mood_id": 2 }
    ]);
  
    await render(<HomeScreen/>)
    // TestId is needeed to ensure the rendered mood matches the one in the list from the endpoint
    const moodCard = screen.getByTestId("todayMood-1") 
    const moodCard2 = screen.getByTestId("todayMood-2")
    expect(within(moodCard).getByText("Good")).toBeTruthy();
    expect(within(moodCard).getByText("11:20 am")).toBeTruthy();  // ensure local time conversion work (utc + 1)
    expect(within(moodCard2).getByText("Awful"));
})


