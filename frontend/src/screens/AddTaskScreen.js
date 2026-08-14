import React from 'react';
import { Modal, View, Text, TextInput, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TITLE_TEXT_SIZE, BODY_TEXT_SIZE } from '../config/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAddTasks } from '../hooks/useAddTasks';

const FIELD_COLOR = '#F8F8FD'
const FIELD_HEIGHT = 55
const FIELD_MARGIN_TOP = 1  

/**
 * Displays the Add Tasks modal allowing the user to input 
 * description, frequency, weekday, and time for the task they wish to add 
 * to their to-do list. 
 * 
 * @param {boolean} visible - indicates whether the modal is visible.
 * @param {Function} onRequestClose - callback used to set the modal's visibility. 
 * @param {Function} onTaskAdded - callback called after a task is added to the task list. 
 * @returns {React.ReactElement} the rendered modal. 
 */
export const AddTaskModal = ({ visible, onRequestClose, onTaskAdded }) => {

    const {
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
    } = useAddTasks(onTaskAdded, onRequestClose); 

    return (
        <Modal visible={visible}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} // closes keyboard when user taps on the screen
                accessible={false}>
                <View style={styles.dialogCard}>
                    <TouchableOpacity style={styles.xButton} onPress={handleCancel}>
                        <Text style={styles.xText}>x</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Add Task</Text>
                    <Text style={styles.secondaryTitle}>Add task description</Text>
                    <TextInput style={styles.inputText}
                        placeholder="Briefly type the task description"
                        value={description}
                        maxLength={25}  // ensures description fits in the card
                        onChangeText={setDescription}    // allows the user to see what they type
                    />
                    <Text style={styles.secondaryTitle}>Frequency</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={frequency}  
                            onValueChange={(value) => setFrequency(value)}
                        >
                            <Picker.Item label={'Daily'} value={'daily'} />
                            <Picker.Item label={'Weekly'} value={'weekly'} />
                        </Picker>
                    </View>
                    {frequency === 'weekly' && (
                        <>
                            <Text style={styles.secondaryTitle}>Day</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={weekday}  
                                    onValueChange={(value) => setWeekday(value)}>
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
                    <TouchableOpacity
                        style={styles.timePickerContainer}
                        onPress={() => setOpenPicker(true)}> 
                        <Text style={styles.timeText}>
                            {time? 
                            time.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit"
                            })
                            : "Select time"}   {/*Displayed by default*/}
                        </Text>
                        <Ionicons
                            style={{marginRight: 8}}  // matches Picker arrow's position
                            name="caret-down-outline"
                            size={13}
                            color='#696969'
                        />
                    </TouchableOpacity>
                    {openPicker &&
                        <DateTimePicker
                            value={time ?? new Date()}  // type Date() to have timezone information
                            mode="time"  
                            onChange={handleTimeChange}
                        />
                    }
                    <TouchableOpacity style={styles.addTaskButton} onPress={handleAdd}>
                        <Text style={styles.addTaskButtonText}>Add task</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </Modal >
    )
}

const styles = StyleSheet.create({
    dialogCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 25,
        paddingTop: 28,
    },
    xButton: {
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
