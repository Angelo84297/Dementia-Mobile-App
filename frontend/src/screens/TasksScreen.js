import { View, Text, FlatList, StyleSheet, Pressable, TouchableOpacity, Alert, Image } from 'react-native';
import { BODY_TEXT_SIZE, TITLE_TEXT_SIZE, SMALL_TEXT_SIZE, PRIMARY_COLOR } from '../config/theme.js';
import { PATIENT_ID } from '../config/config.js';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { AddTaskModal } from './AddTaskScreen';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { deleteTask } from '../api/taskApi.js';
import { datetimeToTime } from '../utils/timeConversion.js';
import TodoImage from '../../assets/images/to-dolist-bro.png';
import { useTasks } from '../hooks/useTasks.js';
import { getTaskDayLabel } from '../utils/getTaskDayLabel.js';

/**
 * Displays the user's to-do list and allows to add or remove tasks. 
 * 
 * For each task the task description, the time and the scheduled day are included. 
 * An instruction message is displayed when the to-do list is empty.
 * 
 * @returns {React.ReactElement} The rendered tasks screen.  
 */
export default function TasksScreen() {

    const { taskList, refreshTasks, removeTask } = useTasks();
    const [modalVisible, setModalVisible] = useState(false); // Controls whether AddTaskScreen is visible.

    /**
     * Deletes a task and displays cofirmation or error to the user. 
     * 
     * @param {number} taskId - ID of the task to delete. 
     */
    async function handleDelete(taskId) {
        try {
            await removeTask(taskId);
            Alert.alert('Task deleted', 'The task was successfully deleted.');
        } catch (e) {
            console.error(e);
            Alert.alert('Error deleting task', 'Please try again.');
        }
    }

    return (
        <View style={styles.pageContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>To-do list</Text>
            </View>
            <Pressable style={styles.addTaskButton} onPress={() => setModalVisible(true)}>   {/*Display "add task" component */}
                <Ionicons name='add-circle' size={SMALL_TEXT_SIZE} color={PRIMARY_COLOR} />
                <Text style={styles.buttonText}>Add task</Text>
            </Pressable>
            {taskList.length === 0 && (
                <View style={styles.instructionContainer}>
                    <Text style={styles.instructionText}>Tap on "Add task" to add a new task to your To-do list!</Text>
                    <Image source={TodoImage} style={{ width: 420, height: 300 }} />
                </View>
            )}
            <FlatList
                data={taskList}
                renderItem={({ item }) =>
                    <View
                        testID={`task-card${item.task_id}`}
                        style={styles.taskContainer}>
                        <View style={styles.taskCardLeftSide}>
                            <Ionicons
                                name="notifications"
                                size={30}
                                color='#B2B0F6'
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.taskDescription}>{item.description}</Text>
                                <View style={styles.timeRow}>
                                    {/* display today / weekday*/}
                                    <Ionicons
                                        name="calendar-outline"
                                        size={SMALL_TEXT_SIZE}
                                        color="#8F92A1"
                                    />
                                    <Text style={styles.timeText}>{getTaskDayLabel(item.frequency, item.weekday)}</Text>
                                    <Ionicons name='time-outline' style={styles.timeIcon} size={SMALL_TEXT_SIZE} color='#8F92A1' />
                                    <Text style={styles.timeText}>{datetimeToTime(item.notification_time)}</Text>

                                </View>
                            </View>
                        </View>
                        <View style={styles.taskCardRightSide}>
                            <Menu>
                                <MenuTrigger
                                    testID={`options-button-${item.task_id}`}>
                                    <Ionicons
                                        name="ellipsis-vertical"
                                        size={24}
                                        color="#1A1446"
                                    />
                                </MenuTrigger>
                                <MenuOptions>
                                    <MenuOption
                                        testID={`delete-task-${item.task_id}`}
                                        onSelect={() => handleDelete(item.task_id)}>   {/* Arrow function ensures deletion only happens when called */}
                                        <Text>Delete task</Text>
                                    </MenuOption>
                                </MenuOptions>
                            </Menu>
                        </View>
                    </View>
                }
                keyExtractor={(item) => item.task_id.toString()}
            />
            <AddTaskModal    // remains hidden until add Task is tapped
                testID='add-task-modal'
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}   // hide when 'X' is pressed
                onTaskAdded={() => refreshTasks()}
            />
        </View>

    );
}

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        backgroundColor: '#f9f7fb'
    },
    header: {
        marginTop: 40,
        marginBottom: 15,
        marginLeft: 15
    },
    headerTitle: {
        fontSize: TITLE_TEXT_SIZE,
        fontWeight: 'bold',
    },
    addTaskButton: {
        flexDirection: "row",
        marginLeft: 290,
        alignItems: "center",
        gap: 7,
        marginBottom: 5
    },
    buttonText: {
        fontSize: SMALL_TEXT_SIZE,
        fontWeight: 'bold',
        color: PRIMARY_COLOR
    },
    taskContainer: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // push left side away from 3 dots
        borderRadius: 25,
        paddingVertical: 30,
        paddingHorizontal: 20,
        marginVertical: 10,
        marginHorizontal: 20,
    },
    taskDescription: {
        fontSize: SMALL_TEXT_SIZE,
        marginBottom: 4,
    },
    textContainer: {      // used for container wrapping description and time to display them in a column
        marginLeft: 12,
        justifyContent: 'center',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: SMALL_TEXT_SIZE,
        color: '#8F92A1',
        marginLeft: 5,
        fontWeight: '350',
    },
    instructionText: {
        fontSize: BODY_TEXT_SIZE,
        flexWrap: 'wrap',
        fontWeight: '450',
        padding: 25,
        textAlign: 'center',
    },
    instructionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
        marginTop: 100
    },
    taskCardLeftSide: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    taskCardRightSide: {
        flexDirection: 'row',
    },
    timeIcon: {
        marginLeft: 9
    }
})