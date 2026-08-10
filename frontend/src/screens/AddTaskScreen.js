import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import { TITLE_TEXT_SIZE, BODY_TEXT_SIZE, PATIENT_ID, PRIMARY_COLOR } from './HomeScreen';
import DateTimePicker from '@react-native-community/datetimepicker';
import { setAbortController } from '../utils/setAbortController';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { API_URL } from '../config/apiConfig';

const FIELD_COLOR = '#F8F8FD'
const FIELD_HEIGHT = 55
const FIELD_MARGIN_TOP = 1
async function LogTask(patientId, description, notificationTime, frequency, weekday) {
    const { signal, clearTimer } = setAbortController();


    try {
        // hardcoded webserver address
        const response = await fetch(`${API_URL}/task/`, {  // Await since the response is not returned immediately
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
        setWeekday(null);
    }

    const handleAdd = async () => {

        if (description.length < 6) {   // ensure the description is meaningful
            Alert.alert('Invalid description', 'Please type more then 5 letters.');
            return;
        } else if (time === null) {
            Alert.alert('Time not selected', 'Please select a time for the task.');
            return;
        } else if (frequency === 'weekly' && weekday === null) {
            Alert.alert('Day not selected', 'Please select a day for the weekly task');
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

            <View style={styles.dialogCard}>
                {/* X Button */}
                <TouchableOpacity style={styles.xButton} onPress={handleCancel}>
                    <Text style={styles.xText}>x</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Add Task</Text>

                <Text style={styles.secondaryTitle}>Add task description</Text>

                <TextInput style={styles.inputText}
                    placeholder="Briefly type the task description"
                    value={description}
                    maxLength={25}  // ensures description fits in the card
                    onChangeText={setDescription}    // when the user types, the input is updated by setDescription
                />

                <Text style={styles.secondaryTitle}>Frequency</Text>

                {/* Select frequency */}
                <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={frequency}  // currently selected 
                            onValueChange={(value) => setFrequency(value)}
                        >
                            <Picker.Item label={'Daily'} value={'daily'} />
                            <Picker.Item label={'Weekly'} value={'weekly'} />                            
                        </Picker>
                </View>
                {/* Select day */}
                {frequency === 'weekly' && (
                    <>
                        <Text style={styles.secondaryTitle}>Day</Text>
                        <View style={styles.pickerContainer}>
                        <Picker 
                            selectedValue={weekday}  // currently selected 
                            onValueChange={(value) => setWeekday(value)}
                        >
                            <Picker.Item label={'Select day'} value={null} />
                            <Picker.Item label={'Sunday'} value={1} />
                            <Picker.Item label={'Monday'} value={2} />
                            <Picker.Item label={'Tuesday'} value={3} />
                            <Picker.Item label={'Wednesday'} value={4} />
                            <Picker.Item label={'Thursday'} value={5} />
                            <Picker.Item label={'Friday'} value={6} />
                            <Picker.Item label={'Saturday'} value={7} />
                        </Picker>
                        </View>
                    </>
                )}

                <Text style={styles.secondaryTitle}>Time</Text>
                {/*Select Time */}
                <TouchableOpacity 
                style={styles.timePickerContainer}
                onPress={() => setOpenPicker(true)}>  {/*setOpenPicker expects a boolean */}
                    <Text style={styles.timeText}>
                        {time
                            ? time.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                            : "Select time"}   {/* Displayed by default when time is null */}

                    </Text>
                    <Ionicons
                        style={{ marginRight: 8 }}  // matches Picker arrow's position
                        name="caret-down-outline"
                        size={13}
                        color= '#696969'
                    />
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
                <TouchableOpacity style={styles.addTaskButton} onPress={handleAdd}>
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
        paddingHorizontal: 25,
        paddingTop: 28,   
    },
    xButton : {
        position: 'absolute',
        top: 20,
        right: 24,
        height: 50, 
        width: 50, 
        justifyContent: 'center',
        backgroundColor: '#F8F8FD',
        alignItems: 'center', 
        borderRadius: 12,
    },
    xText: {
        fontSize: 30,
        fontWeight: '200',
    },
    title: {
        fontSize: TITLE_TEXT_SIZE,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        marginTop: 20
    },
    secondaryTitle: {
        fontWeight: 'bold',
        fontSize: BODY_TEXT_SIZE,
        marginBottom: 9,
        marginTop: 30  // add space between fields
    },
    inputText: {
        backgroundColor: FIELD_COLOR,
        borderRadius: 14,
        height: FIELD_HEIGHT,
        fontSize: BODY_TEXT_SIZE,
        paddingHorizontal: 10,  
        marginTop: FIELD_MARGIN_TOP
    },
    addTaskButton: {
        alignSelf: 'center', 
        width: 200, 
        height: 65,
        borderRadius: 35,
        backgroundColor: '#6200ee',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60
    },
    addTaskButtonText: {
        fontWeight: 'bold',
        fontSize: 25,
        color: 'white'
    },
    pickerContainer: { 
        backgroundColor: FIELD_COLOR,
        borderRadius: 14,
        marginTop: FIELD_MARGIN_TOP
    },
    timePickerContainer: {
        backgroundColor: FIELD_COLOR,
        height: FIELD_HEIGHT, 
        paddingHorizontal: 10,
        paddingVertical: 12,
        marginTop: FIELD_MARGIN_TOP,
        flexDirection: 'row',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'space-between', // to have text and arrow at opposite ends
    },
    timeText: {
        fontSize: BODY_TEXT_SIZE
    },
})
