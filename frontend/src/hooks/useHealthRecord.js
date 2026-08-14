    import { useEffect, useState } from 'react';
    import { getTodayHealthSummary } from '../api/healthApi';
    import { PATIENT_ID, timezone } from '../config/config';
    
    /**
     * Manages the daily health record state.
     * 
     * @returns {Object} the current daily health record object containing 
     * total step count, average heartbeat and sleep time.
     */
    export function useHealthRecord() {

        const [dailyHealthRecord, setHealthRecord] = useState(null);

        /**
         * Loads and manages the state of daily health records. 
         */
        const loadHealthRecord = async () => {

            const healthData = await getTodayHealthSummary(PATIENT_ID, timezone);
            setHealthRecord(healthData);
        }

        useEffect(() => {
            loadHealthRecord();
        }, [])

        return dailyHealthRecord;
    }