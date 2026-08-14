import { useState } from "react";
import { Alert } from "react-native";
import { logTask } from "../api/taskApi";
import { PATIENT_ID } from "../config/config";

/**
 * Manages the state of the Add Tasks modal and adds task to the task list. 
 * 
 * @param {Function} onTaskAdded to execute when a new task is added to the task list.
 * @param {Function} onRequestClose to execute when the x button is pressed or when 
 * a task is added to the task list. 
 * @returns {Object} An object containing task description, time, openPicker (to display 
 * time picker), frequency, weekday, functions to manage their states and add tasks. 
 */
export function useAddTasks(onTaskAdded, onRequestClose) {
    const [description, setDescription] = useState(''); 
    const [time, setTime] = useState(null);
    const [openPicker, setOpenPicker] = useState(false); // invisible unless the user taps "Select Time"
    const [frequency, setFrequency] = useState('daily'); 
    const [weekday, setWeekday] = useState(null);


    /**
     * Resets Add task modal values back to default. 
     */
    const resetAddTaskScreen = () => {
        setDescription('');
        setTime(null);
        setFrequency('daily');
        setWeekday(null);
    };

    /**
     * Adds a new task to the task list. 
     * Displays Alerts indidcating success, failure or input errors for 
     * the user. 
     */
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
            await logTask(
                PATIENT_ID,
                description,
                time,
                frequency,
                weekday
            );

            onTaskAdded?.(); 
            resetAddTaskScreen();
            onRequestClose?.();
            Alert.alert('Task recorded', 'Your task has been recorded successfully.');

        } catch (e) {
            console.error(e);
            Alert.alert('Task log failed', 'Please try again later.');
        }

    };

    /**
     * Resets Add task modal to default values and executes callback. 
     */
    const handleCancel = () => {
        resetAddTaskScreen(); 
        onRequestClose(); 
    };
    /**
     * Handles time selection for the DateTimePicker and its visibility. 
     * 
     * @param {Object} event object provided by the DateTimePicker. 
     * @param {Date} selectedTime the time selected by the user. 
     */
    const handleTimeChange = (event, selectedTime) => {
        setOpenPicker(false); // to close the DateTimePicker once the time is selected
        if (selectedTime) { 
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
