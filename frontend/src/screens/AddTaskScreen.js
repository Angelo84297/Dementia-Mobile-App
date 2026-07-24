import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { TITLE_TEXT_SIZE, BODY_TEXT_SIZE} from './HomeScreen';
import DateTimePicker from '@react-native-community/datetimepicker';

export const AddTaskModal = ({ visible, onRequestClose }) => {
    const [description, setDescription] = useState('');  // '' is the initial state, before the user types the description
    const [time, setTime] = useState(null);   
    const [openPicker, setOpenPicker] = useState(false);  // invisible unless the user taps on "Select Time"
    const [frequency, setFrequency] = useState('daily'); // default to daily

    const handleAdd = () => {}     // called when a new task is added. Need to add call to endpoint. 

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
