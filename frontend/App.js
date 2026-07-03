import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICON_SIZE = 75  // mood icons
const BODY_TEXT_SIZE = 15
const TITLE_TEXT_SIZE = 35  
const PATIENT_ID = 1 // patient id for the MVP. Authentication not implemented in this version. 

function MoodButton({icon, label, mood}) { 
  return (
    <Pressable 
      style={{alignItems: "center"}} 
      onPress={() => {UpdateMood(PATIENT_ID, mood)}}
    >
      <MaterialCommunityIcons
        name={icon}
        size={ICON_SIZE}
        color="#6200ee"
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
    <View style={[styles.container, {padding: 50, justifyContent: "center"}]}> 
      <Text style={{fontWeight: "bold", fontSize: TITLE_TEXT_SIZE}} >Good Morning, Madison!</Text>  {/* Need to replace name with patient's name */}
      <StatusBar style="auto"/>
      <Text style={{fontSize: BODY_TEXT_SIZE, marginVertical: 15}}>How are you feeling today? </Text>  {/* Needs to change depending on whether mood was logged*/}
      <View style={{ 
        flexDirection: "row", /* Align buttons in a row*/
        justifyContent: "center"}}>  
          <MoodButton icon="emoticon-excited-outline" label="Rad" mood={5}/>
          <MoodButton icon="emoticon-happy-outline" label="Good" mood={4}/>
          <MoodButton icon="emoticon-neutral-outline" label="Meh" mood={3}/>
          <MoodButton icon="emoticon-sad-outline" label="Bad" mood={2}/>
          <MoodButton icon="emoticon-cry-outline" label="Awful" mood={1}/>
      </View> 
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
