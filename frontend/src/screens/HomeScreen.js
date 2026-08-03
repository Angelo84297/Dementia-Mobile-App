import { StyleSheet, Text, View, Pressable, Alert, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const ICON_SIZE = 67  // mood icons
export const BODY_TEXT_SIZE = 20
export const TITLE_TEXT_SIZE = 32 
const ICON_COLOR = "#6200ee"  // mood icons
export const PATIENT_ID = 1 // patient id for the MVP. Authentication not implemented in this version. 
export const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;  // local timezone

const moodTextMap = {  // maps to be combined
  1 : "Awful", 
  2 : "Bad", 
  3 : "Fair", 
  4 : "Good", 
  5 : "Super"
}

const moodIconMap = {
  1 : "emoticon-cry-outline", 
  2 : "emoticon-sad-outline", 
  3 : "emoticon-neutral-outline", 
  4 : "emoticon-happy-outline", 
  5 : "emoticon-excited-outline"
}

function MoodButton({icon, label, onPress}) { 
  return (
    <Pressable 
      style={{alignItems: "center"}} 
      onPress={onPress}
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
Update mood accepts values from 1 (awful) to 5 (excellent).
*/
async function updateMood(patientId, moodValue) {
  try {
    const response = await fetch('http://192.168.1.65:8000/mood/', {  // local IP address. Await is used since the response is not returned immediately
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({   // stringify converts body in JSON object for FastAPI
        patient_id: patientId,
        mood: moodValue,
      }),
    });

    if (!response.ok) {   // response.ok is true when HTTP status indicates success 
    throw new Error("Mood update failed");  // when this line is reached the rest of the try block is skipped
    }

    const data = await response.json();   // new row inserted in database
    console.log('Mood updated successfully:', data);
    Alert.alert('Mood logged', 'Your mood has been recorded successfully.'); // message for the user
    return true; // return true if mood was logged
   // shown on the UI 
  } catch (e) {
    console.error('Error updating mood:', e);  // display error in terminal
    Alert.alert('Mood update failed', 'Please try again.'); 
  }
}

export default function HomeScreen() {
  // List storing Today's mood list fetched from API 
  const [moodList, setMoodList] = useState([]);  // setMoodList is the function used to update moodList. useState stores and updates the moodList 
  // Function wrapping mood GET request so it can be called more than once
  const loadMoodList = () => {
    // HTTP request
    fetch(`http://192.168.1.65:8000/mood/${PATIENT_ID}/today?timezone_name=${encodeURIComponent(timezone)}`, {method: 'GET'})     
    // fetch returns response object 
      .then(response => {
        if(!response.ok){
          throw new Error("Could not fetch mood list");
        }
        return response.json();
      })
      .then(data => setMoodList(data))
      .catch(error => console.error(error))
  }

  // load the mood list when the component is displayed on the screen
  useEffect(() => {
    loadMoodList(); 
  }, []);


  const handlePress = async (moodValue) => { 
    const success = await updateMood(PATIENT_ID, moodValue);  // waits for server response
    if (success) {   // if a new mood is logged
      loadMoodList();  // fetch mood list to make UI refresh every time a new mood is logged
    }
  }

  return (
    <View style={styles.pageContainer}> 
      {/*Greetings */}
      <Text style={{fontWeight: "bold", fontSize: TITLE_TEXT_SIZE, marginHorizontal: 20,}} >Good Morning, Madison!</Text>  {/* Need to replace name with patient's name */}
      <Text style={{fontSize: BODY_TEXT_SIZE, marginVertical: 10, marginHorizontal: 20,}}>How are you feeling today? </Text>  {/* Needs to change depending on whether mood was logged*/}
      {/*Mood button row */}
      <View style={styles.moodButtonRow}>  
          <MoodButton icon="emoticon-excited-outline" label={moodTextMap[5]} onPress={() => handlePress(5)}/>
          <MoodButton icon="emoticon-happy-outline" label={moodTextMap[4]} onPress={() => handlePress(4)}/>
          <MoodButton icon="emoticon-neutral-outline" label={moodTextMap[3]} onPress={() => handlePress(3)}/>
          <MoodButton icon="emoticon-sad-outline" label={moodTextMap[2]} onPress={() => handlePress(2)}/>
          <MoodButton icon="emoticon-cry-outline" label={moodTextMap[1]} onPress={() => handlePress(1)}/>
      </View>
      {/* Display only when there is mood items in the list */}
        {moodList.length > 0 && (    
          <Text style={{fontSize:TITLE_TEXT_SIZE, fontWeight:'bold', marginBottom: 10, marginHorizontal: 20,}}>Today's Mood</Text>
       )}
        <FlatList     // displays a scrollable list. Only renders visible items
        data={moodList}
        renderItem={({item}) => 
        /* Mood card */
        <View style={styles.moodCard}>  
          <MaterialCommunityIcons name = {moodIconMap[item.mood]} size={ICON_SIZE} color={ICON_COLOR}/>    
          <Text style={{fontSize:BODY_TEXT_SIZE}}>{moodTextMap[item.mood]}</Text>
          <Text style={{fontSize:BODY_TEXT_SIZE}}>
            { // Convert timestamp to local time
              new Date(item.created_at).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            })}
            </Text>
        </View>}
        keyExtractor={(item) => item.mood_id.toString()}
      />
    </View>

  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f9f7fb',
  },
  moodButtonRow : {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 25, 
    paddingVertical: 13, // add space within the card
    marginVertical: 20, 
  },
  moodCard: {
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginVertical: 15, 
    marginHorizontal: 20,
    alignItems: "center",
    backgroundColor: '#FFFFFF',
    borderRadius: 25, 
    paddingVertical: 20, // add space within the card
  }
});
