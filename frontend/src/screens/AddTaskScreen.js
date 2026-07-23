import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { TITLE_TEXT_SIZE, BODY_TEXT_SIZE} from './HomeScreen';
import DateTimePicker from '@react-native-community/datetimepicker';

export const AddTaskModal = ({ visible, onRequestClose }) => {
    const [description, setDescription] = useState('');  // '' is the initial state, before the user types the description
    const [time, setTime] = useState(new Date()); // Date is needed for Datetimepicker despite only time is used 
    const [openPicker, setOpenPicker] = useState(false);  // invisible unless the user taps on "Select Time"

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
            <View style={{padding: 20}}>
                <Text style={styles.title}>Add Task</Text>

                <Text style={styles.secondaryTitle}>Add task description</Text>

                <TextInput style={styles.placeholder}
                    placeholder="Briefly type the description of the task"
                    value={description}
                    onChangeText={setDescription}    // when the user types, the input is updated by setDescription
                />

                <Text style={styles.secondaryTitle}>Frequency</Text>

                <Text style={styles.secondaryTitle}>Time</Text>

                
                {/*Select Time */}
                <TouchableOpacity onPress={() => setOpenPicker(true)}>  {/*setOpenPicker expects a boolean */}
                    <Text > Select Time</Text>
                </TouchableOpacity>
                


                {openPicker &&   // display dateTimePicker when true 
                    <DateTimePicker 
                        value={time}
                        mode="time"   // display time
                        onChange={handleTimeChange}
                    />
                }


                <Button 
                    title="Cancel"
                    onPress={handleCancel}
                />

                {/*Add task button */}
                <TouchableOpacity onPress={handleAdd}>
                    <Text > Add task</Text>
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
    }

})
