import { View, Text, FlatList, StyleSheet, Pressable, TouchableOpacity, Alert, Image } from 'react-native';
import { BODY_TEXT_SIZE, TITLE_TEXT_SIZE, PATIENT_ID, SMALL_TEXT_SIZE, PRIMARY_COLOR } from './HomeScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { AddTaskModal } from './AddTaskScreen';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { syncNotifications } from '../services/notifications';
import { loadTaskList } from '../services/taskApi';
import { datetimeToTime } from '../utils/datetimeConversion';
import TodoImage from '../../assets/images/to-dolist-bro.png';
import { setAbortController } from '../utils/setAbortController';
import { API_URL } from '../config/apiConfig.js';

async function DeleteTask(taskId) {
    const { signal, clearTimer } = setAbortController()
    try {
        const response = await fetch(`${API_URL}/patients/${PATIENT_ID}/tasks/${taskId}`, {  // Await is used since the response is not returned immediately
            method: 'DELETE',
            signal
        });

        clearTimer();

        if (!response.ok) {   // response.ok is true when HTTP status indicates success 
            throw new Error("Task could not be deleted");
        }

        Alert.alert('Task deleted', 'The task was successfully deleted.'); // message for the user
        return true; // return true if log was successful 

    } catch (e) {
        console.error(e.message);  // display error in terminal
        Alert.alert('Error deleting task', 'Please try again.');
        return false;
    }
}

export default function TasksScreen() {

    const [taskList, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false); // Controls whether add Task component is visible. Defaults to false as it's opened by the add task button

    function refreshTasks() {
        loadTaskList()
            .then(data => setTasks(data))
            .catch(error => console.error(error))
        syncNotifications();   // update notifications 
    }

    async function handleDelete(taskId) {    // if an item is successfully deleted dispay the current task list
        const response = await DeleteTask(taskId);

        if (response) {
            refreshTasks();
        }
    }

    function getTaskDayLabel(frequency, day) {

        // if task.frequency is daily display today
        if (frequency === 'daily') {
            return 'Today'
        }

        const today = new Date().getDay() + 1;  // with getDay() Sunday = 0, in the backend Sunday = 1 

        console.log('today is', today);
        console.log('Input day is', day);
        if (frequency === 'weekly' && day === today) {
            return 'Today'
        }

        const weekdays = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ]

        return weekdays[day - 1]
    }

    // load tasks when the screen is opened
    useEffect(() => {
        refreshTasks()
    }, []);

    return (
        <View style={styles.pageContainer}>

            {/*Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}> To-do list </Text>
            </View>
            {/*Add task button. Button wraps text and icon */}
            <Pressable style={styles.addTaskButton} onPress={() => setModalVisible(true)}>   {/*Display "add task" component */}
                <Ionicons name='add-circle' size={SMALL_TEXT_SIZE} color={PRIMARY_COLOR} />
                <Text style={styles.buttonText}>Add task </Text>
            </Pressable>
            {/*Message for when task list is empty*/}
            {taskList.length === 0 && (
                <View style={styles.instructionContainer}>
                    <Text style={styles.instructionText}>Tap on "Add task" to add a new task to your To-do list!</Text>
                    <Image source={TodoImage} style={{ width: 420, height: 300 }} />
                </View>
            )}
            {/* List of tasks */}
            <FlatList     // displays a scrollable list. Only renders visible items
                data={taskList}
                renderItem={({ item }) =>
                    /* Task card */
                    <View style={styles.taskContainer}>
                        {/*Left side of task card */}
                        <View style={styles.taskCardLeftSide}>
                            <Ionicons
                                name="notifications"
                                size={30}
                                color='#B2B0F6'
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.taskDescription}>{item.description}</Text>
                                <View style={styles.timeRow}>
                                    {/* display today / week day*/}
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
                            {/* Right side of task card */}
                        </View>
                        <View style={styles.taskCardRightSide}>
                            <Menu>
                                <MenuTrigger>
                                    <Ionicons
                                        name="ellipsis-vertical"
                                        size={24}
                                        color="#1A1446"
                                    />
                                </MenuTrigger>

                                <MenuOptions>
                                    <MenuOption onSelect={() => handleDelete(item.task_id)}>   {/* Arrow function is used so it's not called immediately when the page renders */}
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
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}   // when the cancel button is pressed it's hidden again
                onTaskAdded={() => refreshTasks()}   // the function is passed to avoid circular dependency. 
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
        alignItems: "center",  // ensure the icon is equally distant from top and bottom of the row
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
        paddingVertical: 30, // add space within the card
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