import azure.functions as func
import os
import datetime 
import pymysql
from authentication import get_access_token
from google_health import fetch_data_points

app = func.FunctionApp()

"""
the function app is triggered every 1 hour. 
"""
@app.timer_trigger(schedule="0 0 */1 * * *", arg_name="myTimer", run_on_startup=True,    # run_on_startup recommended to stay False in production
              use_monitor=False) 
def fetch_hourly_health_records(myTimer: func.TimerRequest) -> None:

    access_token = get_access_token()
    now = datetime.datetime.utcnow() # utc required for sending get request to Google Health 
    # start time is 12 hours so data can be up to date despite late syncs 
    start_time = (now - datetime.timedelta(hours=12)).strftime("%Y-%m-%dT%H:%M:%SZ")  # convert to string for Google Health API request

    # The header needs to show the token to prove authorization for data access 
    headers = {"Authorization": f"Bearer {access_token}"}
    # Filtering parameters for the GET request
    steps_params = {"filter": f'steps.interval.start_time >= "{start_time}"', "pageSize": 1000} # PageSize needed when fetching large amounts of data
    heartbeat_params = {"filter": f'heart_rate.sample_time.physical_time >= "{start_time}"', "pageSize": 5000}
    steps_url = "https://health.googleapis.com/v4/users/me/dataTypes/steps/dataPoints"
    heartbeat_url = "https://health.googleapis.com/v4/users/me/dataTypes/heart-rate/dataPoints"

    steps_dps = fetch_data_points(steps_url, headers=headers, params=steps_params)
    heartbeat_dps = fetch_data_points(heartbeat_url, headers=headers, params=heartbeat_params)

    # store steps, average heartbeat for each hour inside inner dictionary
    hour_buckets = {}  # datetime is used as keys

    # loop through data points and aggregate data for each hour. 
    for data_point in steps_dps: 
        
        step_count = int(data_point['steps']['count'])
        # Truncate the string leaving date and hour. Add :00:00 as it's the format accepted by MySQL
        hour_block = data_point['steps']['interval']['startTime'][:13] + ":00:00"   
        
        # initialise hour block if not in the dictionary
        if hour_block not in hour_buckets: 
            hour_buckets[hour_block] = {"stepcount" : 0, "bpm_sum" : 0, "bpm_count": 0}   # sum and count used to calculate heart rate hourly average

        hour_buckets[hour_block]["stepcount"] += step_count
    
    for data_point in heartbeat_dps: 
        bpm = int(data_point['heartRate']['beatsPerMinute'])
        
        hour_block = data_point['heartRate']['sampleTime']['physicalTime'][:13] + ":00:00"
        if hour_block not in hour_buckets: 
            hour_buckets[hour_block] = {"stepcount" : 0, "bpm_sum" : 0, "bpm_count": 0}   
        
        hour_buckets[hour_block]["bpm_sum"] += bpm 
        hour_buckets[hour_block]["bpm_count"] += 1

    # Save data in Database
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
                "ON DUPLICATE KEY UPDATE step_count = VALUES(step_count), "  # if data for a datetime was already recorded update the value. 
                "average_heart_rate = VALUES(average_heart_rate);"          # It ensures the database doesn't miss late syncs
            )                                                              

            patient_id = int(os.environ["PATIENT_ID"])

            for hour_block in hour_buckets:
                hourly_step_count = hour_buckets[hour_block]["stepcount"]

                if (hour_buckets[hour_block]["bpm_count"] > 0):   # to ensure 0/0 is avoided 
                    hr_hourly_average = hour_buckets[hour_block]["bpm_sum"]/hour_buckets[hour_block]["bpm_count"]
                else: 
                    hr_hourly_average = None  # if there is no data for heart_rate it's better to give None to avod misleading AI

                cursor.execute(
                    sql_query,
                    (patient_id, hourly_step_count, hr_hourly_average, hour_block),
                )

        connection.commit()

    except Exception as e: 
        # In case of errors revert all the changes in the database. 
        connection.rollback()
        print("Database transaction failed: ", e)
    finally: 
        # Ensure resources are released
        connection.close()
    

"""
the function app is triggered every 8 hours to fetch sleep data that may happen at night or during the day. 
"""
@app.timer_trigger(schedule="0 0 */8 * * *", arg_name="myTimer", run_on_startup=True,    # run_on_startup recommended to stay False in production
              use_monitor=False) 
def fetch_sleep_records(myTimer: func.TimerRequest) -> None:

    access_token = get_access_token()

    now = datetime.datetime.utcnow() # utc required for sending get request to Google Health 
    start_time = (now - datetime.timedelta(hours=48)).strftime("%Y-%m-%dT%H:%M:%SZ")  # convert to string for Google Health API request
    
    # The header needs to show the token to prove authorization for data access 
    headers = {"Authorization": f"Bearer {access_token}"}
    # Filtering parameters for the GET request
    sleep_params = {"filter": f'sleep.interval.end_time >= "{start_time}"'} 

    sleep_url = "https://health.googleapis.com/v4/users/me/dataTypes/sleep/dataPoints"
    sleep_dps = fetch_data_points(sleep_url, headers=headers, params=sleep_params)

    try: 
        # connect to database
        connection = pymysql.connect(
                host=os.environ["DB_HOST"],
                user=os.environ["DB_USER"],
                password=os.environ["DB_PASSWORD"],
                database=os.environ["DB_NAME"],
                autocommit=False,
            )
        
        with connection.cursor() as cursor:  # automatically close the cursor
            sql_query = (
                "INSERT INTO sleep (patient_id, start_time, end_time, minutes_asleep, minutes_awake) "
                "VALUES (%s, %s, %s, %s, %s) "
                "ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), "  
                "end_time = VALUES(end_time), "          # Ensures the database doesn't miss late syncs
                "minutes_asleep = VALUES(minutes_asleep), "    
                "minutes_awake = VALUES(minutes_awake); "
            )   

            patient_id = int(os.environ["PATIENT_ID"])

            # loop through data points and save sleep sessions in database
            for data_point in sleep_dps: 
                
                minutes_asleep = int(data_point["sleep"]['summary']['minutesAsleep']) 
                end_time = (data_point["sleep"]["interval"]["endTime"][:19]).replace("T", " ")   # change the format for MySQL
                start_time = (data_point["sleep"]["interval"]["startTime"][:19]).replace("T", " ")
                minutes_awake = int(data_point["sleep"]['summary']['minutesAwake'])
                
                cursor.execute(
                    sql_query,
                    (patient_id, start_time, end_time, minutes_asleep, minutes_awake),
                )
        
        connection.commit()

        
    except Exception as e: 
        # In case of errors revert all the changes in the database. 
        connection.rollback()
        print("Database transaction failed: ", e)

    finally: 
        # Ensure resources are released
        connection.close()
        



