import { StyleSheet, Text, View, Pressable, FlatList, Alert } from 'react-native';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMood } from '../hooks/useMood';
import { datetimeToTime } from '../utils/timeConversion';
import { PRIMARY_COLOR, BODY_TEXT_SIZE, TITLE_TEXT_SIZE } from '../config/theme';

const MOOD_ICON_SIZE = 67

// maps mood values to corresponding labels
const moodTextMap = {
  1: "Awful",
  2: "Bad",
  3: "Fair",
  4: "Good",
  5: "Super"
}

// maps mood values to corresponding icons
const moodIconMap = {
  1: "emoticon-cry-outline",
  2: "emoticon-sad-outline",
  3: "emoticon-neutral-outline",
  4: "emoticon-happy-outline",
  5: "emoticon-excited-outline"
}

/**
 * Renders a mood button component with a mood icon and label. 
 * 
 * @param {string} icon - the Material Community icon to display.
 * @param {string} label - the label under the button to display.
 * @param {Function} onPress - the callback function to trigger.
 */

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

/**
 * Manages the home screen UI. 
 * 
 * It displays: 
 * - Mood buttons that can be used by the user to log their mood
 *  from 1 (Awful) to 5 (Super).
 * - A list of the user's daily mood. 
 * 
 * @returns {React.ReactElement} the rendered home screen. 
 */
export default function HomeScreen() {

  // using custom hook to separate logic from UI
  const { moodList, recordMood } = useMood()

  /**
   * Records the selected mood and displays the result to the user. 
   * 
   * @param {number} moodValue - the mood value between 1 (Awful) and 5 (Super). 
   */
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
              {datetimeToTime(item.created_at)}
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
