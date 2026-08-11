import { useTasks } from "../hooks/useTasks";
import { screen, render } from "@testing-library/react-native";
import { MenuProvider } from "react-native-popup-menu";
import { Ionicons } from "@expo/vector-icons/Ionicons";
import TasksScreen from "./TasksScreen";

jest.mock("../hooks/useTasks", () => ({
    useTasks: jest.fn()
}));

// to avoid errors related to loading icons
jest.mock("@expo/vector-icons/Ionicons", () => () => null);


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
        refreshTasks: jest.fn()
    });
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

("Renders tasks and the time they are due", async () => {
    renderTasksScreen();
    const taskCard = screen.getByText("Make lunch")
    const taskCard2 = screen.getByText("Take Magnesium")
    expect(within(taskCard).getByText("12:30 am")).toBeTruthy();  // for timezone utc + 1
    expect(within(taskCard).getByText("16:30 am")).not.toBeTruthy();
    expect(within(taskCard2).getByText("16:30 am")).toBeTruthy();
});

("Displays suggestion to add tasks when taskList is empty", async () => {
    renderTasksScreen();
    useTasks.mockReturnValue({
        taskList: [],
        refreshTasks: jest.fn()
    });

    expect(screen.getByText("Tap on 'Add task' to add a new task to your To-do list!"));

})

//test("Calls refresh tasks when tasks are removed", async () => {
//    renderTasksScreen();

//    await 


//})