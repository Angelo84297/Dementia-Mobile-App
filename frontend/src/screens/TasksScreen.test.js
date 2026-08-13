import { useTasks } from "../hooks/useTasks";
import { screen, render, within, fireEvent, waitFor} from "@testing-library/react-native";
import { MenuProvider } from "react-native-popup-menu";
import { Ionicons } from "@expo/vector-icons/Ionicons";
import TasksScreen from "./TasksScreen";
import {Alert} from 'react-native';

jest.mock("../hooks/useTasks", () => ({
    useTasks: jest.fn()
}));

// to avoid errors related to loading icons
jest.mock("@expo/vector-icons/Ionicons", () => () => null);

jest.spyOn(Alert, "alert"); 


beforeEach(() => {
    useTasks.mockReturnValue({
        taskList: [
            {
                task_id: 1,
                description: "Make lunch",
                frequency: "daily",
                notification_time: "2026-08-11T11:30:00Z",
                weekday: null
            },
            {
                task_id: 2,
                description: "Take magnesium",
                frequency: "daily",
                notification_time: "2026-08-11T15:30:00Z",
                weekday: null
            }
        ],
        refreshTasks: jest.fn(),
        removeTask: jest.fn(),
    });
    jest.clearAllMocks();
});


function renderTasksScreen() {
    render(
        // required ancestor
        <MenuProvider>
            <TasksScreen />
        </MenuProvider>
    );
}

test("Renders header and Add task button ", () => {
    renderTasksScreen();

    expect(screen.getByText("To-do list")).toBeTruthy();
    expect(screen.getByText("Add task")).toBeTruthy();
});

test("Renders tasks, the time they are due and option button for each task card", async () => {
    renderTasksScreen();
    const taskCard = screen.getByTestId("task-card1")
    const taskCard2 = screen.getByTestId("task-card2")
    expect(within(taskCard).getByText("Make lunch")).toBeTruthy()
    expect(within(taskCard).getByText("12:30")).toBeTruthy();  // for timezone utc + 1
    expect(screen.getByTestId("options-button-1")).toBeTruthy()
    expect(within(taskCard2).getByText("Take magnesium")).toBeTruthy()
    expect(within(taskCard2).getByText("16:30")).toBeTruthy();  // for timezone utc + 1
    expect(screen.getByTestId("options-button-2")).toBeTruthy()
});

test("Displays suggestion to add tasks when taskList is empty", async () => {
    useTasks.mockReturnValue({
        taskList: [],
        refreshTasks: jest.fn(),
        removeTask: jest.fn()
    });

    renderTasksScreen();

    expect(screen.getByText('Tap on "Add task" to add a new task to your To-do list!'));

})

test("display the Add Task modal when the 'Add task' button is tapped", () => { 
    renderTasksScreen();

    fireEvent.press(screen.getByText("Add task"))

    expect(screen.getByText("Add task description")).toBeTruthy();
    expect(screen.getByPlaceholderText("Briefly type the task description")).toBeTruthy();

})
        
