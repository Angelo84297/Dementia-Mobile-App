import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { syncNotifications, loadTaskList, BODY_TEXT_SIZE } from '../../App';   // need to call when tasks are updated
import { TITLE_TEXT_SIZE, PATIENT_ID} from './HomeScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import { AddTaskModal } from './AddTaskScreen';
 
const BUTTON_SIZE = 18

export default function TasksScreen () {

    const [taskList, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false); // Controls whether add Task component is visible. Defaults to false as it's opened by the add task button

    // load tasks when the screen is opened
    useEffect(() => {
        loadTaskList()
        .then(data => setTasks(data))
        .catch(error => console.error(error))
    }, []);
    
    return(
        <View style={styles.pageContainer}>

                {/*Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}> To-do list </Text>
                </View>
                {/*Add task button. Button wraps text and icon */}  
                <Pressable style={styles.addTaskButton} onPress={() => setModalVisible(true)}>   {/*Display "add task" component */}
                    <Ionicons name = 'add-circle' size = {BUTTON_SIZE} color = '#6200ee' />
                    <Text style={styles.buttonText}>Add task </Text> 
                </Pressable>

                {/* List of tasks */}

                <FlatList     // displays a scrollable list. Only renders visible items
                    data={taskList}
                    renderItem={({item}) => 
                    /* Task card */
                    <View style={styles.taskContainer}>  
                        {/*Left side of the card */}
                        <View style={{flexDirection : 'row', alignItems: 'center'}}>
                            <Ionicons 
                                name = "notifications"
                                size = {30}
                                color = '#B2B0F6'
                            />
                            <View style={styles.textContainer}>
                                <Text style={styles.taskDescription}>{item.description}</Text>
                                <View style={styles.timeRow}> 
                                    <Ionicons name='time-outline' size={14} color ='#8F92A1' />
                                    <Text style={styles.timeText}>08:30 AM</Text>
                                </View>
                            </View> 
                        </View>
                    </View>
                    }
                    keyExtractor={(item) => item.id}

                />

                <AddTaskModal    // remains hidden until add Task is tapped
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}   // when the cancel button is pressed it's hidden again
                    //onAddTask={addTask}
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
        fontSize :  TITLE_TEXT_SIZE, 
        fontWeight : 'bold',
    },
    addTaskButton : {
        flexDirection : "row", 
        marginLeft : 290,
        alignItems: "center",  // ensure the icon is equally distant from top and bottom of the row
        gap: 7,
        marginBottom: 5
    },
    buttonText : {
        fontSize : BUTTON_SIZE, 
        fontWeight : 'bold',
        color: '#6200ee'
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
        fontSize: 20, 
        fontWeight:'690', 
        marginBottom: 4,
    },
    textContainer : {      // used for container wrapping description and time to display them in a column
        marginLeft: 12, 
        justifyContent : 'center',
    },
    timeRow: {
        flexDirection : 'row',
        alignItems: 'center'
    }, 
    timeText : {
        fontSize: 13, 
        color: '#8F92A1', 
        marginLeft: 4,
        fontWeight: '500',
    }

})