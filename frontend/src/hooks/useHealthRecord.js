    import { useEffect, useState } from 'react';
    import { getTodayHealthSummary } from '../api/healthApi';
    import { PATIENT_ID, timezone } from '../config/config';
    
    // custom hook 
    export function useHealthRecord() {

        const [dailyHealthRecord, setHealthRecord] = useState(null);
        const loadHealthRecord = async () => {

            const healthData = await getTodayHealthSummary(PATIENT_ID, timezone);
            setHealthRecord(healthData);

        }
        useEffect(() => {
            loadHealthRecord();
        }, [])

        return dailyHealthRecord;
    }