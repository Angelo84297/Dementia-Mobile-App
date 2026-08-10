import { StyleSheet, Text, View, Pressable, FlatList, Alert } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMood } from '../hooks/useMood';


const MOOD_ICON_SIZE = 67
export const BODY_TEXT_SIZE = 18
export const TITLE_TEXT_SIZE = 37
export const PRIMARY_COLOR = "#6200ee"
export const PATIENT_ID = 1 // patient id for the MVP. Authentication not implemented in this version. 
export const SMALL_TEXT_SIZE = 18  // used for smaller elements (e.g. buttons). Recommended max 18
export const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;  // local timezone

const moodTextMap = {
  1: "Awful",
  2: "Bad",
  3: "Fair",
  4: "Good",
  5: "Super"
}

const moodIconMap = {
  1: "emoticon-cry-outline",
  2: "emoticon-sad-outline",
  3: "emoticon-neutral-outline",
  4: "emoticon-happy-outline",
  5: "emoticon-excited-outline"
}

function MoodButton({ icon, label, onPress }) {
  return (
    <Pressable
      style={{ alignItems: "center" }}
      onPress={onPress}
    >
      <MaterialCommunityIcons
        name={icon}
        size={MOOD_ICON_SIZE}
        color={PRIMARY_COLOR}
      />
      <Text style={{ fontSize: BODY_TEXT_SIZE }}>{label}</Text>
    </Pressable>
  );
}


export default function HomeScreen() {

  // using custom hook to separate logic from UI
  const { moodList, recordMood } = useMood()

  async function handlePress(moodValue) {

    const success = await recordMood(moodValue);

    if (success) {
      Alert.alert('Mood logged', 'Your mood has been recorded successfully.');

    } else {
      Alert.alert('Mood update failed', 'Please try again later.');
    }
  }

  return (
    <View style={styles.pageContainer}>
      {/* User name is a placeholder */}
      <Text style={{ fontWeight: 'bold', fontSize: TITLE_TEXT_SIZE, marginHorizontal: 20 }}>Good Morning, Madison!</Text>
      <Text style={{ fontSize: BODY_TEXT_SIZE, marginVertical: 10, marginHorizontal: 20 }}>How are you feeling today?</Text>
      <View style={styles.moodButtonRow}>
        <MoodButton icon="emoticon-excited-outline" label={moodTextMap[5]} onPress={() => handlePress(5)} />
        <MoodButton icon="emoticon-happy-outline" label={moodTextMap[4]} onPress={() => handlePress(4)} />
        <MoodButton icon="emoticon-neutral-outline" label={moodTextMap[3]} onPress={() => handlePress(3)} />
        <MoodButton icon="emoticon-sad-outline" label={moodTextMap[2]} onPress={() => handlePress(2)} />
        <MoodButton icon="emoticon-cry-outline" label={moodTextMap[1]} onPress={() => handlePress(1)} />
      </View>
      {moodList.length > 0 && (
        <Text style={{ fontSize: TITLE_TEXT_SIZE, fontWeight: 'bold', marginBottom: 10, marginHorizontal: 20 }}>Today's Mood</Text>
      )}
      <FlatList
        data={moodList}
        renderItem={({ item }) => (
          <View style={styles.moodCard}
            testID={`todayMood-${item.mood_id}`}>
            <MaterialCommunityIcons name={moodIconMap[item.mood]} size={MOOD_ICON_SIZE} color={PRIMARY_COLOR} />
            <Text style={{ fontSize: BODY_TEXT_SIZE }}>{moodTextMap[item.mood]}</Text>
            <Text style={{ fontSize: BODY_TEXT_SIZE }}>
              {new Date(item.created_at).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </View>
        )}
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
  moodButtonRow: {
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
    padding: 16,
  }
});
