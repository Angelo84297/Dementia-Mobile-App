import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Pressable, Alert } from 'react-native';
import { TITLE_TEXT_SIZE, BODY_TEXT_SIZE, PATIENT_ID} from './HomeScreen';
import DateTimePicker from '@react-native-community/datetimepicker';

async function LogTask(patientId, description, notificationTime, frequency) {
  try {
    // hardcoded webserver address
    const response = await fetch('http://192.168.1.65:8000/task/', {  // Await is used since the response is not returned immediately
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({   // stringify converts body in JSON object for FastAPI
        patient_id: patientId,
        description: description,
        notification_time: notificationTime,
        frequency: frequency, 
      }),
    });

    if (!response.ok) {   // response.ok is true when HTTP status indicates success 
    throw new Error("Task log failed");  
    }

    const data = await response.json();   // new row inserted in database
    console.log('New task logged successfully:', data);
    Alert.alert('Task recorded', 'Your task has been recorded successfully.'); // message for the user
    return true; // return true if log was successful 

  } catch (e) {
    console.error(e.message);  // display error in terminal
    Alert.alert('Task log failed', 'Please try again.'); 
    return false
  }
}



export const AddTaskModal = ({ visible, onRequestClose, onTaskAdded }) => {    
    const [description, setDescription] = useState('');  // '' is the initial state, before the user types the description
    const [time, setTime] = useState(null);   
    const [openPicker, setOpenPicker] = useState(false);  // invisible unless the user taps on "Select Time"
    const [frequency, setFrequency] = useState('daily'); // default to daily

    const handleAdd = async () => {
        const success = await LogTask(
            PATIENT_ID,
            description,
            time,
            frequency, 
        )

        if (success) {
            onTaskAdded?.();     // when the task is added execute the callback functions if they exist
            onRequestClose?.();
        }
    
    }     // called when a new task is added. 

    const handleCancel = () => {
        setDescription('');  // set the description to an empty string when handleCancel is called
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
        fontSize :  TITLE_TEXT_SIZE, 
        fontWeight : 'bold',
    },
    secondaryTitle: {
        fontWeight : 'bold',
        fontSize :  18, 
    },
    placeholder: {
        fontSize: 16
    }, 
    selectedFrequency : {
        backgroundColor: '#6200ee'
    },
    addTaskButtonText : {
    fontWeight : 'bold',
    fontSize : 25, 
    }

})
