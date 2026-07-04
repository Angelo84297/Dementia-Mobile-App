import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Pressable, Alert, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const ICON_SIZE = 75  // mood icons
const BODY_TEXT_SIZE = 20
const TITLE_TEXT_SIZE = 37 
const ICON_COLOR = "#6200ee"  // mood icons
const PATIENT_ID = 1 // patient id for the MVP. Authentication not implemented in this version. 

// mood mock data
const MOODLIST = [
  {
    mood: 3,
    created_at: "11:40 AM"  // ISO 8601
  },
  {
    mood: 1, 
    created_at: "06:30 PM" 
  },
  {
    mood: 1, 
    created_at: "06:30 PM" 
  },
  {
    mood: 1, 
    created_at: "06:30 PM" 
  },
  {
    mood: 1, 
    created_at: "06:30 PM" 
  },
  {
    mood: 1, 
    created_at: "06:30 PM" 
  },
]

function MoodButton({icon, label, mood}) { 
  return (
    <Pressable 
      style={{alignItems: "center"}} 
      onPress={() => {UpdateMood(PATIENT_ID, mood)}}
    >
      <MaterialCommunityIcons
        name={icon}
        size={ICON_SIZE}
        color={ICON_COLOR}
      />
      <Text style={{fontSize: BODY_TEXT_SIZE}}>{label}</Text>
    </Pressable>

  );
}

/*
To update mood accepts values from 1 (awful) to 5 (excellent).
*/
async function UpdateMood(patientId, newMood) {
  try {
    const response = await fetch('http://192.168.1.65:8000/mood/', {  // local IP address. Awit is used since the response is not returned immediately
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({   // stringify converts body in JSON object for FastAPI
        patient_id: patientId,
        mood: newMood,
      }),
    });

    if (!response.ok) {   // response.ok is true when HTTP status indicates success 
    throw new Error("Mood update failed");  // when this line is reached the rest of the try block is skipped
    }

    const data = await response.json();   // new row inserted in database
    console.log('Mood updated successfully:', data);
    Alert.alert('Mood logged', 'Your mood has been recorded successfully.');   // shown on the UI 
  } catch (e) {
    console.error('Error updating mood:', e);  // display error in terminal
    Alert.alert('Mood update failed', 'Please try again.'); 
  }
}

export default function App() {
  return (
    <View style={styles.container, {padding: 50, justifyContent: "center"}}> 
      <Text style={{fontWeight: "bold", fontSize: TITLE_TEXT_SIZE}} >Good Morning, Madison!</Text>  {/* Need to replace name with patient's name */}
      <StatusBar style="auto"/>
      <Text style={{fontSize: BODY_TEXT_SIZE, marginVertical: 15}}>How are you feeling today? </Text>  {/* Needs to change depending on whether mood was logged*/}
      <View style={{ 
        flexDirection: "row", /* Align buttons in a row*/
        justifyContent: "center"}}>  
          <MoodButton icon="emoticon-excited-outline" label="Rad" mood={5}/>
          <MoodButton icon="emoticon-happy-outline" label="Good" mood={4}/>
          <MoodButton icon="emoticon-neutral-outline" label="So so" mood={3}/>
          <MoodButton icon="emoticon-sad-outline" label="Bad" mood={2}/>
          <MoodButton icon="emoticon-cry-outline" label="Awful" mood={1}/>
      </View>
        <Text style={{fontSize:TITLE_TEXT_SIZE, fontWeight:'bold', marginVertical: 15}}>Today's Mood</Text>
        <FlatList     // displays a scrollable list. Only renders visible items
        data={MOODLIST}
        renderItem={({item}) => 
        <View style={[styles.listItem, {flexDirection: "row", justifyContent: "space-between", marginVertical: 15}, {alignItems: "center"}]}>  
          <MaterialCommunityIcons name = "emoticon-excited-outline" size={ICON_SIZE} color={ICON_COLOR}/>    {/* need to replace emoji depending on mood */}
          <Text style={{fontSize:BODY_TEXT_SIZE}}>{item.mood}</Text>
          <Text style={{fontSize:BODY_TEXT_SIZE}}>{item.created_at}</Text>
        </View>}
        keyExtractor={(item) => item.id}
      />
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
