import { fireEvent, render, waitFor, screen } from "@testing-library/react-native";
import renderer, { act } from "react-test-renderer";
import {Alert} from 'react-native';
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

/* Tests whether the saved snapshot matches the rendered screen */
test("HomePage renders correctly", () => {
  const tree = renderer.create(<HomeScreen />).toJSON();

  expect(tree).toMatchSnapshot();  
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

// pressing a mood log button sends request to fetch new mood list)
test("Pressing mood button calls updateMood API ", async () => {
    updateMood.mockResolvedValue(true);  
    await render(<HomeScreen/>)

    await act(async () => { // fire events updating state need to be wrapped in act 
      fireEvent.press(screen.getByText("Good"));
    })
    
    expect(updateMood).toHaveBeenCalledWith(1, 4); // patient id and mood value
    ;
})

