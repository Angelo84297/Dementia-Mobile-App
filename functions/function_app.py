import logging
import azure.functions as func
import requests
import os
import datetime 
import pymysql

app = func.FunctionApp()

"""
the function app is triggered every 1 hour. 
"""
@app.timer_trigger(schedule="0 0 */1 * * *", arg_name="myTimer", run_on_startup=True,    # run_on_startup recommended to stay False in production
              use_monitor=False) 
def google_health_api(myTimer: func.TimerRequest) -> None:

    logging.info('Azure Function timer triggered Google Health sync.')

    # Load data for new access token from local.settings.json
    client_id = os.environ["GOOGLE_CLIENT_ID"]
    client_secret = os.environ["GOOGLE_CLIENT_SECRET"]
    refresh_token = os.environ["GOOGLE_REFRESH_TOKEN"]   # needed so the user doesn't have to give authorization for evey fetch

    # Google OAuth authorization endpoint to which credentials are sent to. 
    token_url =  "https://oauth2.googleapis.com/token"
    # Data needed by Google to send new token
    token_payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }

    try: 
        # Request to get new token needed to fetch health data
        google_response = requests.post(token_url, data=token_payload)
        # Check if response was successful. If it fails jump to except block
        google_response.raise_for_status()
        # Parse JSON format response in dictionary and save new token 
        access_token = google_response.json()['access_token']

    except Exception as e: 
        logging.error(f"Access token request failed: {e}")
        return

    now = datetime.datetime.utcnow() # utc required for sending get request to Google Health 
    # The start time of the query
    start_time = (now - datetime.timedelta(hours=6)).strftime("%Y-%m-%dT%H:%M:%SZ")  # convert to string for Google Health API request

    # The header needs to show the token to prove authorization for data access 
    headers = {"Authorization": f"Bearer {access_token}"}
    # Filtering parameters for the GET request
    steps_params = {"filter": f'steps.interval.start_time >= "{start_time}"', "pageSize": 1000} # needed when fetching large amounts of data
    heartbeat_params = {"filter": f'heart_rate.sample_time.physical_time >= "{start_time}"', "pageSize": 5000}
    steps_url = "https://health.googleapis.com/v4/users/me/dataTypes/steps/dataPoints"
    heartbeat_url = "https://health.googleapis.com/v4/users/me/dataTypes/heart-rate/dataPoints"

    try : 
        steps_response = requests.get(steps_url, headers=headers, params=steps_params)
        steps_response.raise_for_status()  # jump to except in case of error
        heartbeat_response = requests.get(heartbeat_url, headers=headers, params=heartbeat_params)
        heartbeat_response.raise_for_status()

        steps_dps = steps_response.json().get("dataPoints", [])  # an empty list can be returned in case the value doesn't exist
        heartbeat_dps = heartbeat_response.json().get("dataPoints", [])

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

                    hr_hourly_average = 0 
                    hourly_step_count = hour_buckets[hour_block]["stepcount"]

                    if (hour_buckets[hour_block]["bpm_count"] > 0):   # to ensure 0/0 is avoided 
                        hr_hourly_average = hour_buckets[hour_block]["bpm_sum"]/hour_buckets[hour_block]["bpm_count"]

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
    
    except Exception as e: 
        logging.error(f"Data request failed: {e}")
        return
