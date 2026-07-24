import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { TITLE_TEXT_SIZE, PATIENT_ID, timezone } from './HomeScreen';
import { useEffect, useState } from 'react';

export default function HealthScreen() {

    const [dailyHealthRecord, setHealthRecord] = useState(null);  

  // Function wrapping mood GET request so it can be called more than once
  const loadHealthRecord = () => {
    // HTTP request
    fetch(`http://192.168.1.65:8000/healthsummary/${PATIENT_ID}/today?timezone_name=${encodeURIComponent(timezone)}`, {method: 'GET'})     
    // fetch returns response object 
      .then(response => {
        if(!response.ok){
          throw new Error("Could not fetch Health Record");
        }
        return response.json();
      })
      .then(data => {
        setHealthRecord(data);
      })
      .catch(error => console.error(error))
  }

  useEffect(() => {
    loadHealthRecord(); 
  }, []);

  // convert minutes in a string showing hours and minutes.
  function minutes_to_hours (total_min) {
    if (total_min == null) {
        return null 
    } else {
        const hours = Math.floor(total_min / 60);
        const min = total_min % 60;
        return `${hours} h ${min} m`;
  }}

  return (
    // Expand container to take all the space in the screen 
    <View style={{ flex: 1 }}>
        {/* Ensure the user can scroll and read the whole advice */}
        <ScrollView>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}> Health overview </Text>
            </View>
            {/* Cards Grid */}
            <View style={styles.grid}>

                {/* Sleep card */}
                <View style={[styles.card, { backgroundColor: '#E0E0FF'}]}>
                    <View style={styles.cardRow}>   
                        <Ionicons name ='moon' size={25} />
                        <Text style={styles.cardTitle}> Sleep time </Text>
                    </View>
                     {/* Display No record if the api call returns null value */}
                    <Text style={styles.cardValue}> {minutes_to_hours(dailyHealthRecord?.max_sleep_minutes) ?? "No record"} </Text>    
                </View>
                {/* Heart rate card */}
                <View style={[styles.card, { backgroundColor: '#b2e9e1'}]}>
                    <View style={styles.cardRow}> 
                        <Ionicons name ='heart' size={25} />
                        <Text style={styles.cardTitle}> Heart Rate </Text>
                    </View>
                    <Text style={styles.cardValue}> {
                    minutes_to_hours(dailyHealthRecord?.average_heart_rate) != null 
                    /* show if average bpm is not null*/
                    ? dailyHealthRecord?.average_heart_rate + " bpm" 
                    /* show if average bpm is null*/
                    : "No record"} </Text>
                </View>
                {/* Water cups card */}
                <View style={[styles.card, { backgroundColor: '#5fd3e5'}]}>
                    <View style={styles.cardRow}> 
                        <MaterialCommunityIcons name ='cup-water' size={25} />
                        <Text style={styles.cardTitle}> Water </Text>
                    </View>
                    {/* Placeholder  for Water log*/ }
                    <Text style={styles.cardValue}> No record </Text>   
                </View>
                {/* Steps  card */}
                <View style={[styles.card, { backgroundColor: '#F5A5A5'}]}> 
                    <View style={styles.cardRow}>
                        <Ionicons name ='footsteps' size={25} />
                        <Text style={styles.cardTitle}> Walking </Text>
                    </View>
                    <Text style={styles.cardValue}> {dailyHealthRecord?.total_step_count} steps </Text>
                </View>

            </View>
                <View>
                    <View style={[styles.reccomendationCard, { backgroundColor: '#88e1e9'}]}> 
                        <View style={styles.cardRow}>
                            <Ionicons name ='sparkles' size={25} />
                            <Text style={styles.reccomendationTitle}> AI Wellbeing reccomandation </Text>
                        </View>
                    <Text style={styles.reccomendationBody}> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. </Text>
                    </View>
                </View>

        </ScrollView>
    </View>
);
}

{/* Separating the style makes the code more readeable */}
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
    card: { 
        width : '47%',   // fit two cards in each row. The percentage is used so the same layout can be applied independently from the smaprtphone
        padding : 16, 
        marginBottom : 20, 
        borderRadius : 16,   // make edges circular
    }, 
    grid: { 
        flexDirection : "row", 
        flexWrap : "wrap",  // make children wrap into multiple lines when overflowing
        justifyContent : 'space-between',
        paddingHorizontal : 16,
    },
    cardRow: {
        flexDirection: "row",   // make icon and title appear next to each other
        alignItems: 'center',
        gap: 6   // space between icon and text
    },
    cardTitle: {
        fontSize : 18, 
        fontWeight : '450'
    },
    cardValue: {
        fontSize : 25, 
        fontWeight : 'bold',
        color: '#0A1C3A'
    },
    reccomendationCard: {
        marginTop:25, 
        borderRadius : 16,
        paddingHorizontal : 20,  // push content inward
        marginHorizontal: 16,   // space from both sides
        paddingTop: 15
    },
    reccomendationTitle: {
    fontWeight : 'bold',
        fontSize : 25, 
    },
    reccomendationBody: {
        fontSize : 25,
        marginTop : 10
    }
    
})

