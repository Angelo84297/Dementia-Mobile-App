import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TITLE_TEXT_SIZE, BODY_TEXT_SIZE } from '../config/theme.js';
import { useHealthRecord } from '../hooks/useHealthRecord.js';
import { useWellbeingAdvice } from '../hooks/useWellbeingAdvice.js';
import { datetimeToTime, minutesToHours } from '../utils/timeConversion.js';

/**
 * Displays the daily health records and the AI wellbeing advice.
 * 
 * Daily health records include total step count,
 * average heart rate and sleep time. An ActivityIndicator is displayed while 
 * the AI wellbeing advice is loading.
 * The water cup log is currently a placeholder. 
 * 
 * @returns {React.ReactElement} the rendered health screen. 
 */
export default function HealthScreen() {

    const dailyHealthRecord = useHealthRecord()
    const { wellbeingAdvice, isLoading } = useWellbeingAdvice()

    return (
        <View style={{ flex: 1 }}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Health overview</Text>
                </View>
                {/* Cards Grid */}
                <View style={styles.grid}>
                    {/* Sleep card */}
                    <View style={[styles.card, { backgroundColor: '#E0E0FF' }]}>
                        <View style={styles.cardRow}>
                            <Ionicons name='moon' size={25} />
                            <Text style={styles.cardTitle}>Sleep time</Text>
                        </View>
                        <Text style={styles.cardValue}>{minutesToHours(dailyHealthRecord?.max_sleep_minutes) ?? "No record"}</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: '#b2e9e1' }]}>
                        <View style={styles.cardRow}>
                            <Ionicons name='heart' size={25} />
                            <Text style={styles.cardTitle}>Heart Rate</Text>
                        </View>
                        <Text style={styles.cardValue}>
                            {dailyHealthRecord?.average_heart_rate != null
                                ? dailyHealthRecord?.average_heart_rate + " bpm"
                                : "No record"}
                        </Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: '#5fd3e5' }]}>
                        <View style={styles.cardRow}>
                            <MaterialCommunityIcons name='cup-water' size={25} />
                            <Text style={styles.cardTitle}>Water</Text>
                        </View>
                        {/* Placeholder */}
                        <Text style={styles.cardValue}>No record</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: '#F5A5A5' }]}>
                        <View style={styles.cardRow}>
                            <Ionicons name='footsteps' size={25} />
                            <Text style={styles.cardTitle}>Walking</Text>
                        </View>
                        <Text style={styles.cardValue}>
                            {dailyHealthRecord?.total_step_count != null
                                ? dailyHealthRecord?.total_step_count + " steps"
                                : "No record"}
                        </Text>
                    </View>
                </View>
                <View>
                    <View style={[styles.recommendationCard, { backgroundColor: '#88e1e9' }]}>
                        <View style={styles.cardRow}>
                            <Ionicons name='sparkles' size={25} />
                            <Text style={styles.recommendationTitle}>AI Wellbeing reccomandation</Text>
                            {!isLoading && wellbeingAdvice && <Text style={styles.recommendationTim}>
                                {datetimeToTime(wellbeingAdvice?.created_at)}
                            </Text>}
                        </View>
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#000000" testID='wellbeing-advice-loading' />
                            </View>) :
                            (<Text style={styles.recommendationBody}>
                                {wellbeingAdvice?.content ?? "Wellbeing advice temporarily unavailable"}
                            </Text>
                            )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

{/* Styles separated for readability */ }
const styles = StyleSheet.create({
    header: {
        marginTop: 40,
        marginBottom: 15,
        marginLeft: 15
    },
    headerTitle: {
        fontSize: TITLE_TEXT_SIZE,
        fontWeight: 'bold',
    },
    card: {
        width: '47%',   // fit two cards in each row
        padding: 16,
        marginBottom: 20,
        borderRadius: 16,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",  // make health record cards wrap into 2 lines
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    cardRow: {
        flexDirection: "row",
        alignItems: 'center',
        gap: 6
    },
    cardTitle: {
        fontSize: BODY_TEXT_SIZE,
        fontWeight: '450'
    },
    cardValue: {
        fontSize: BODY_TEXT_SIZE,
        fontWeight: 'bold',
    },
    recommendationCard: {
        marginTop: 25,
        borderRadius: 16,
        paddingHorizontal: 20,  // push content inward
        marginHorizontal: 16,
        paddingTop: 16,
        minHeight: 180, // ensures there is space around the ActivityIndicator
    },
    recommendationTitle: {
        flex: 1,
        fontWeight: 'bold',
        fontSize: 26,
        flexShrink: 1
    },
    recommendationBody: {
        fontSize: BODY_TEXT_SIZE,
        marginTop: 10
    },
    recommendationTime: {
        marginLeft: "auto",
        fontSize: BODY_TEXT_SIZE,
        fontWeight: "500"
    },
    loadingContainer: {
        marginTop: 20
    }

})

