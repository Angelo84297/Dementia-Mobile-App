import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ICON_SIZE = 75  // mood icons
const BODY_TEXT_SIZE = 15
const TITLE_TEXT_SIZE = 35  

function MoodButton({icon, label}) { 
  return (
    <Pressable 
      style={{alignItems: "center"}} 
      onPress={() => {}}
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

export default function App() {
  return (
    <View style={styles.container, {padding: 50, justifyContent: "center"}}>
      <Text style={{fontWeight: "bold", fontSize: TITLE_TEXT_SIZE}} >Good Morning, Madison!</Text>  {/* Need to replace name with patient's name */}
      <StatusBar style="auto"/>
      <Text style={{fontSize: BODY_TEXT_SIZE, marginVertical: 15}}>How are you feeling today? </Text>  {/* Needs to change depending on whether mood was logged*/}
      <View style={{ 
        flexDirection: "row", /* Align buttons in a row*/
        justifyContent: "center"}}>  
          <MoodButton icon="emoticon-excited-outline" label="Rad"/>
          <MoodButton icon="emoticon-happy-outline" label="Good"/>
          <MoodButton icon="emoticon-neutral-outline" label="Meh"/>
          <MoodButton icon="emoticon-sad-outline" label="Bad"/>
          <MoodButton icon="emoticon-cry-outline" label="Awful"/>
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
