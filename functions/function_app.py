import azure.functions as func
import os
import datetime 
import pymysql
from authentication import get_access_token
from google_health import fetch_data_points

app = func.FunctionApp()


@app.timer_trigger(
        schedule="0 */15 * * * *", arg_name="myTimer", 
        run_on_startup=True,    # needs to be set on False in production
        use_monitor=False) 
def fetch_hourly_health_records(myTimer: func.TimerRequest) -> None:
    """
    Fetches health data from the last 12 hours from Google Health API 
    every 15 minutes. Health data includes step count and heatbeat data. 
    Aggregates data in hour blocks and stores them in the database. 
    """

    access_token = get_access_token()  # for sensitive data
    # UTC 0 is required to send requests to Google Health API 
    now = datetime.datetime.utcnow()
    # Data from 12 hours ensure late syncs are fetched
    start_time = (
        now - datetime.timedelta(hours=12)).strftime("%Y-%m-%dT%H:%M:%SZ")  

    headers = {"Authorization": f"Bearer {access_token}"}
    steps_params = {
        "filter": f'steps.interval.start_time >= "{start_time}"', 
        "pageSize": 1000} # to fetch large amounts of data
    heartbeat_params = {
        "filter": f'heart_rate.sample_time.physical_time >= "{start_time}"', 
        "pageSize": 5000}
    steps_url = "https://health.googleapis.com/v4/users/me/dataTypes/steps/dataPoints"
    heartbeat_url = "https://health.googleapis.com/v4/users/me/dataTypes/heart-rate/dataPoints"

    steps_dps = fetch_data_points(
        steps_url, headers=headers, params=steps_params)
    heartbeat_dps = fetch_data_points(
        heartbeat_url, headers=headers, params=heartbeat_params)

    # store steps, average heartbeat for each hour inside inner dictionary
    hour_blocks = {} 

    for data_point in steps_dps: 
        
        step_count = int(data_point['steps']['count'])
        # Format accepted by MySQL
        hour_block = data_point['steps']['interval']['startTime'][:13] + ":00:00"   
        
        if hour_block not in hour_blocks: 
            hour_blocks[hour_block] = {
                "stepcount" : 0, "bpm_sum" : 0, "bpm_count": 0}  

        hour_blocks[hour_block]["stepcount"] += step_count
    
    for data_point in heartbeat_dps: 
        bpm = int(data_point['heartRate']['beatsPerMinute'])
        
        hour_block = data_point['heartRate']['sampleTime']['physicalTime'][:13] + ":00:00"

        if hour_block not in hour_blocks: 
            hour_blocks[hour_block] = {"stepcount" : 0, "bpm_sum" : 0, "bpm_count": 0}   
        
        hour_blocks[hour_block]["bpm_sum"] += bpm 
        hour_blocks[hour_block]["bpm_count"] += 1

    try:
        # Connect to database
        connection = pymysql.connect(
            host=os.environ["DB_HOST"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            database=os.environ["DB_NAME"],
            autocommit=False,
        )

        with connection.cursor() as cursor:  # automatically close the cursor
            sql_query = (
                "INSERT INTO healthrecord (patient_id, step_count, average_heart_rate, hour_block) "
                "VALUES (%s, %s, %s, %s) "
                # Ensures no duplicates are created when updating data
                "ON DUPLICATE KEY UPDATE step_count = VALUES(step_count), "  
                "average_heart_rate = VALUES(average_heart_rate);"         
            )                                                              

            patient_id = int(os.environ["PATIENT_ID"])

            for hour_block in hour_blocks:
                # Assign 0 in absence of data
                hourly_step_count = hour_blocks[hour_block]["stepcount"]   

                if (hour_blocks[hour_block]["bpm_count"] > 0):   # avoid 0/0
                    hr_hourly_average = hour_blocks[hour_block]["bpm_sum"]/hour_blocks[hour_block]["bpm_count"]
                else: 
                    hr_hourly_average = None  # avods misleading Gemini

                cursor.execute(
                    sql_query,
                    (patient_id, hourly_step_count, hr_hourly_average, hour_block),
                )

        connection.commit()

    except Exception as e: 
        connection.rollback()
        print("Database transaction failed: ", e)
    finally: 
        # Ensure resources are released
        connection.close()

    
@app.timer_trigger(
        schedule="0 0 */4 * * *", arg_name="myTimer", run_on_startup=True,  
        use_monitor=False) 
def fetch_sleep_records(myTimer: func.TimerRequest) -> None:
    """
    Fetches sleep sessions from the last 48 hours from Google Health API 
    every 4 hours and stores them in the database.
    """

    access_token = get_access_token()  # for sensitive data

    now = datetime.datetime.utcnow() 
    start_time = (
        now - datetime.timedelta(hours=48)).strftime("%Y-%m-%dT%H:%M:%SZ") 
    
    headers = {"Authorization": f"Bearer {access_token}"}
    sleep_params = {"filter": f'sleep.interval.end_time >= "{start_time}"'} 

    sleep_url = "https://health.googleapis.com/v4/users/me/dataTypes/sleep/dataPoints"
    sleep_dps = fetch_data_points(
        sleep_url, headers=headers, params=sleep_params)

    try: 
        connection = pymysql.connect(
                host=os.environ["DB_HOST"],
                user=os.environ["DB_USER"],
                password=os.environ["DB_PASSWORD"],
                database=os.environ["DB_NAME"],
                autocommit=False,
            )
        
        with connection.cursor() as cursor:  
            sql_query = (
                "INSERT INTO sleep (patient_id, start_time, end_time, minutes_asleep, minutes_awake) "
                "VALUES (%s, %s, %s, %s, %s) "
                "ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), "  
                "end_time = VALUES(end_time), "   
                "minutes_asleep = VALUES(minutes_asleep), "    
                "minutes_awake = VALUES(minutes_awake); "
            )   

            patient_id = int(os.environ["PATIENT_ID"])

            for data_point in sleep_dps: 
                
                minutes_asleep = int(
                    data_point["sleep"]['summary']['minutesAsleep']) 
                end_time = (
                    # format for MySQL
                    data_point["sleep"]["interval"]["endTime"][:19]).replace("T", " ")   
                start_time = (
                    data_point["sleep"]["interval"]["startTime"][:19]).replace("T", " ")
                minutes_awake = int(
                    data_point["sleep"]['summary']['minutesAwake'])
                
                cursor.execute(
                    sql_query,
                    (patient_id, start_time, end_time, minutes_asleep, 
                     minutes_awake),
                )
        
        connection.commit()

    except Exception as e: 
        connection.rollback()
        print("Database transaction failed: ", e)

    finally: 
        # Ensure resources are released
        connection.close()
        



