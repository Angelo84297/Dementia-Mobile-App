import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 

export default function HealthScreen() {
  return (
    <View>
      {/* Expand container to take all the space in the screen */}
        
        <ScrollView>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}> Health overview </Text>
            </View>
            {/* Cards Grid */}
            <View style={styles.grid}>

                <View style={styles.card}>

                    <View style={styles.cardRow}>   
                        <Ionicons name ='moon' size={25}/>
                        <Text style={styles.cardTitle}> Sleep time </Text>
                    </View>

                    <Text style={styles.cardValue}> 7 h 30 m </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}> Heart Rate </Text>
                    <Text style={styles.cardValue}> 68 bpm </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}> Water </Text>
                    <Text style={styles.cardValue}> 5 cups </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}> Walking </Text>
                    <Text style={styles.cardValue}> 3500 steps </Text>
                </View>
            </View>

        </ScrollView>
    </View>
);
}

{/* Separating the style makes the code more readeable */}
const styles = StyleSheet.create({ 
    header: {
        alighItems: 'center', 
        flexDirection: 'row', 
        marginTop: 40,
        marginBottom: 15,
        marginLeft: 15
    },
    headerTitle: {
        fontSize :  20, 
    },
    card: { 
        width : '50%',   // fit two cards in each row
        aspectRatio : 1.25,   // make the cards rectangles
        padding : 14 , 
        marginBottom : 20
    }, 
    grid: { 
        flexDirection : "row", 
        flexWrap : "wrap",  // make children wrap into multiple lines when overflowing
    },
    cardRow: {
        flexDirection: "row",   // make icon and title appear next to each other
        alignItems: 'center',
        gap: 6   // space between icon and text
    },
    cardTitle: {
        fontSize : 18, 
        fontWeight : 400
    },
    cardValue: {
        fontSize : 25, 
        fontWeight : 'bold',
        color: '#0A1C3A'
    }
})

