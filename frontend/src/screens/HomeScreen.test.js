import { fireEvent, render, waitFor, screen } from "@testing-library/react-native";
import HomeScreen from "./HomeScreen";

{/* Mock every fetch call*/}
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),  // empty return
  })
);

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

// pressing a mood log button sends request to fetch new mood list)
test("Pressing mood button sends fetch request", async () => {
    await render(<HomeScreen />)
    fireEvent.press(screen.findByText("Good"));
    expect(fetch).toHaveBeenCalled();
})

