import { Ionicons } from "@expo/vector-icons";
import { useHealthRecord } from "../hooks/useHealthRecord";
import { useWellbeingAdvice } from "../hooks/useWellbeingAdvice";
import HealthScreen from "./HealthScreen";
import { screen, render } from "@testing-library/react-native";


jest.mock("../hooks/useHealthRecord", () => ({
    useHealthRecord: jest.fn()
}));


jest.mock("../hooks/useWellbeingAdvice", () => ({
    useWellbeingAdvice: jest.fn()
}));

// to avoid errors related to loading icons
jest.mock("@expo/vector-icons", () => ({
    MaterialCommunityIcons: () => null,
    Ionicons: () => null
}));


beforeEach(() => {
    useHealthRecord.mockReturnValue({
        max_sleep_minutes: 390,   // 6 h 30 m
        average_heart_rate: 70,
        total_step_count: 6000
    });

    useWellbeingAdvice.mockReturnValue({
        wellbeingAdvice: {
        content: "Hi, I'm your wellbeing companion",
        created_at: "2026-08-11T10:00:00Z",
    },
        isLoading: false,
    });
});

test("Renders header and health card titles ", () => {
    render(<HealthScreen />);
    expect(screen.getByText("Health overview")).toBeTruthy();
    expect(screen.getByText("Sleep time")).toBeTruthy();
    expect(screen.getByText("Heart Rate")).toBeTruthy();
    expect(screen.getByText("Water")).toBeTruthy();
    expect(screen.getByText("Walking")).toBeTruthy();
    expect(screen.getByText("AI Wellbeing reccomandation")).toBeTruthy();
});

test("Health cards display No record when daily health record is returned with null values", () => {
    useHealthRecord.mockReturnValue({
        max_sleep_minutes: null,
        average_heart_rate: null,
        total_step_count: null
    });

    render(<HealthScreen />);

    expect(screen.getAllByText("No record")).toHaveLength(4); // counting water placeholder 

});

test("Displays available daily health record", () => {
    render(<HealthScreen />);

    expect(screen.getByText("6000 steps").toBeTruthy);
    expect(screen.getByText("6 h 30 m").toBeTruthy);
    expect(screen.getByText("70 bpm").toBeTruthy);
});

test("Displays Wellbeing Advice and the time it was generated", () => {
    render(<HealthScreen />);

    expect(screen.getByText("Hi, I'm your wellbeing companion"));
    expect(screen.getByText("11:00"))  // with utc + 1 local time
}
)

test("The activity indicator is displayed during loading", () => {
    useWellbeingAdvice.mockReturnValue({
        isLoading: true,
    });

    render(<HealthScreen />);

    expect(screen.getByTestId('wellbeing-advice-loading').toBeTruthy);
})

test("The activity indicator is not displayed when not loading", () => {   // fails
    render(<HealthScreen />);

    expect(screen.queryByTestId("wellbeing-advice-loading")).not.toBeTruthy(); // query to check if exists
})

test("Display message for the user when the AI advice is not available", () => {
    useWellbeingAdvice.mockReturnValue({
        wellbeingAdvice: null,
        isLoading: false,
    });

    render(<HealthScreen />);

    expect(screen.findByText("Wellbeing advice temporarily unavailable")).toBeTruthy();

})