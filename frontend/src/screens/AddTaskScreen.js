import React from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Pressable, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TITLE_TEXT_SIZE, BODY_TEXT_SIZE, PRIMARY_COLOR } from '../config/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAddTasks } from '../hooks/useAddTasks';

const FIELD_COLOR = '#F8F8FD'
const FIELD_HEIGHT = 55
const FIELD_MARGIN_TOP = 1

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
    } = useAddTasks(onTaskAdded, onRequestClose); // custom hook 

    return (
        <Modal visible={visible}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} // to close keyboard tapping on the screen
                accessible={false}>
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
                            color='#696969'
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
