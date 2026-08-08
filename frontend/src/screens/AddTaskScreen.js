import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import { TITLE_TEXT_SIZE, BODY_TEXT_SIZE, PATIENT_ID } from './HomeScreen';
import DateTimePicker from '@react-native-community/datetimepicker';
import { setAbortController } from '../utils/setAbortController';
import { Picker } from '@react-native-picker/picker';

async function LogTask(patientId, description, notificationTime, frequency, weekday) {
    const { signal, clearTimer } = setAbortController();

    try {
        // hardcoded webserver address
        const response = await fetch('http://192.168.1.65:8000/task/', {  // Await since the response is not returned immediately
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({   // stringify converts body in JSON object for FastAPI
                patient_id: patientId,
                description: description,
                notification_time: notificationTime,
                frequency: frequency,
                weekday: weekday
            }),
            signal
        });

        clearTimer();
        if (!response.ok) {   // response.ok is true when HTTP status indicates success 
            throw new Error(`Task log failed, ${response.status}`);
        }

        const data = await response.json();   // new row inserted in database
        console.log('New task logged successfully:', data);
        Alert.alert('Task recorded', 'Your task has been recorded successfully.'); // message for the user
        return true; // return true if log was successful 

    } catch (e) {
        console.error(e.message);
        Alert.alert('Task log failed', 'Please try again later.');
        return false
    }
}



export const AddTaskModal = ({ visible, onRequestClose, onTaskAdded }) => {
    const [description, setDescription] = useState('');  // '' is the initial state, before the user types the description
    const [time, setTime] = useState(null);
    const [openPicker, setOpenPicker] = useState(false);  // invisible unless the user taps "Select Time"
    const [frequency, setFrequency] = useState('daily'); // default to daily
    const [weekday, setWeekday] = useState(null)   //  Monday

    // a helper functin to reset vaules of AddTaskScreen back to default.
    const resetAddTaskScreen = () => {
        setDescription('');
        setTime(null);
        setFrequency('daily');
    }

    const handleAdd = async () => {

        if (description.length < 6) {   // ensure the description is meaningful
            Alert.alert('Invalid description', 'Please type more then 5 letters.');
            return;
        } else if (time === null) {
            Alert.alert('Time not selected', 'Please select a time for the task.');
            return;
        }

        const success = await LogTask(
            PATIENT_ID,
            description,
            time,
            frequency,
            weekday
        )

        if (success) {
            onTaskAdded?.();     // when the task is added execute the callback functions
            resetAddTaskScreen();
            onRequestClose?.();
        }

    }     // called when a new task is added. 

    const handleCancel = () => {
        resetAddTaskScreen();
        onRequestClose();  // called when the X is pressed 
    }

    const handleTimeChange = (event, selectedTime) => {  // receives the two arguments sent by DateTimePicker
        setOpenPicker(false);    // close the DateTimePicker once the time is selected

        if (selectedTime) {  // if a a time is selected 
            setTime(selectedTime)
        }

    }

    return (
        <Modal visible={visible}>

            <View >
                {/* X Button */}
                <TouchableOpacity onPress={handleCancel}>
                    <Text > X </Text>
                </TouchableOpacity>
                <Text style={styles.title}>Add Task</Text>

                <Text style={styles.secondaryTitle}>Add task description</Text>

                <TextInput style={styles.placeholder}
                    placeholder="Briefly type the description of the task"
                    value={description}
                    maxLength={25}  // ensures description fits in the card
                    onChangeText={setDescription}    // when the user types, the input is updated by setDescription
                />

                <Text style={styles.secondaryTitle}>Frequency</Text>

                {/* Select frequency */}
                <View>
                    <Pressable
                        onPress={() => setFrequency('daily')}  // when pressed the frequency is set on daily
                        style={
                            frequency === 'daily' && styles.selectedFrequency  // highlight the container when daily is tapped
                        }
                    >
                        <Text>Daily</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setFrequency('weekly')}
                        style={
                            frequency === 'weekly' && styles.selectedFrequency  // highlight the container when weekly is tapped
                        }
                    >
                        <Text>Weekly</Text>
                    </Pressable>
                </View>
                {/* Select day */}
                <Text style={styles.secondaryTitle}>Day</Text>
                <Picker
                    selectedValue={weekday}  // currently selected 
                    onValueChange={(value) => setWeekday(value)
                    }>
                    <Picker.Item label={'Select day'} value={null} />
                    <Picker.Item label={'Sunday'} value={1} />
                    <Picker.Item label={'Monday'} value={2} />
                    <Picker.Item label={'Tuesday'} value={3} />
                    <Picker.Item label={'Wednesday'} value={4} />
                    <Picker.Item label={'Thursday'} value={5} />
                    <Picker.Item label={'Friday'} value={6} />
                    <Picker.Item label={'Saturday'} value={7} />
                </Picker>

                <Text style={styles.secondaryTitle}>Time</Text>
                {/*Select Time */}
                <TouchableOpacity onPress={() => setOpenPicker(true)}>  {/*setOpenPicker expects a boolean */}
                    <Text>
                        {time
                            ? time.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                            : "Select time"}   {/* Displayed by default when time is null */}

                    </Text>
                </TouchableOpacity>


                {/* display dateTimePicker when true */}
                {openPicker &&
                    <DateTimePicker
                        value={time ?? new Date()}  // type Date() is needed despite the user selects time
                        mode="time"   // display time
                        onChange={handleTimeChange}
                    />
                }


                {/*Add task button */}
                <TouchableOpacity onPress={handleAdd}>
                    <Text style={styles.addTaskButtonText}> Add task</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    dialogCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
    },
    title: {
        fontSize: TITLE_TEXT_SIZE,
        fontWeight: 'bold',
    },
    secondaryTitle: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    placeholder: {
        fontSize: 16
    },
    selectedFrequency: {
        backgroundColor: '#6200ee'
    },
    addTaskButtonText: {
        fontWeight: 'bold',
        fontSize: 25,
    }

})
