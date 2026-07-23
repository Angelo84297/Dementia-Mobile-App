import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { syncNotifications, loadTaskList, BODY_TEXT_SIZE } from '../../App';   // need to call when tasks are updated
import { TITLE_TEXT_SIZE, PATIENT_ID} from './HomeScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';
 
const BUTTON_SIZE = 18

export default function TasksScreen () {

    const [taskList, setTasks] = useState([]);

    // load tasks when the screen is opened
    useEffect(() => {
        loadTaskList()
        .then(data => setTasks(data))
        .catch(error => console.error(error))
    }, []);
    
    return(
        <View style={{ flex: 1 }}>

                {/*Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}> To-do list </Text>
                </View>
                {/*Add task button. Button wraps text and icon */}  
                <Pressable style={styles.addTaskButton} onPress={() => console.log('pressed')}>
                    <Ionicons name = 'add-circle' size = {BUTTON_SIZE} color = '#6200ee' />
                    <Text style={styles.buttonText}>Add task </Text> 
                </Pressable>

                {/* List of tasks */}

                <FlatList     // displays a scrollable list. Only renders visible items
                    data={taskList}
                    renderItem={({item}) => 
                    <View style={[{flexDirection: "row", justifyContent: "space-between", marginVertical: 15}, {alignItems: "center"}]}>  
                        
                        <Text style={{fontSize:BODY_TEXT_SIZE}}>{item.description}</Text>
                    </View>}
                    keyExtractor={(item) => item.id}
                />


        </View>
    );
}


const styles = StyleSheet.create({
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
        gap: 7
    },
    buttonText : {
        fontSize : BUTTON_SIZE, 
        fontWeight : 'bold',
        color: '#6200ee'
    },
      



})