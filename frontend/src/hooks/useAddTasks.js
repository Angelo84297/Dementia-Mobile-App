import { useState } from "react";
import { Alert } from "react-native";
import { LogTask } from "../api/taskApi";
import { PATIENT_ID } from "../config/config";


export function useAddTasks(onTaskAdded, onRequestClose) {
    const [description, setDescription] = useState(''); // '' before the user types the description
    const [time, setTime] = useState(null);
    const [openPicker, setOpenPicker] = useState(false); // invisible unless the user taps "Select Time"
    const [frequency, setFrequency] = useState('daily'); // default to daily
    const [weekday, setWeekday] = useState(null);

    // a helper functin to reset vaules of AddTaskScreen back to default.
    const resetAddTaskScreen = () => {
        setDescription('');
        setTime(null);
        setFrequency('daily');
        setWeekday(null);
    };

    const handleAdd = async () => {

        if (description.length < 6) { // ensure the description is meaningful
            Alert.alert('Invalid description', 'Please type more then 5 letters.');
            return;
        } else if (time === null) {
            Alert.alert('Time not selected', 'Please select a time for the task.');
            return;
        } else if (frequency === 'weekly' && weekday === null) {
            Alert.alert('Day not selected', 'Please select a day for the weekly task');
            return;
        }

        try {
            await LogTask(
                PATIENT_ID,
                description,
                time,
                frequency,
                weekday
            );

            onTaskAdded?.(); // when the task is added execute the callback functions
            resetAddTaskScreen();
            onRequestClose?.();
            Alert.alert('Task recorded', 'Your task has been recorded successfully.');

        } catch (e) {
            console.error(e);
            Alert.alert('Task log failed', 'Please try again later.');

        }

    };

    const handleCancel = () => {
        resetAddTaskScreen(); // reset state
        onRequestClose(); // when the X is pressed 
    };

    const handleTimeChange = (event, selectedTime) => {
        setOpenPicker(false); // close the DateTimePicker once the time is selected
        if (selectedTime) { // if a a time is selected 
            setTime(selectedTime);
        }

    };

    return {
        description,
        setDescription,
        time, setTime, handleTimeChange,
        openPicker,
        setOpenPicker,
        frequency,
        setFrequency,
        weekday,
        setWeekday,
        handleAdd, handleCancel
    };
}
