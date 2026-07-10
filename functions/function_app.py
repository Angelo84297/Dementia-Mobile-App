import logging
import azure.functions as func
import requests
import os
import datetime 

app = func.FunctionApp()

"""
the function app is triggered every 1 hour. 
"""
@app.timer_trigger(schedule="0 0 */1 * * *", arg_name="myTimer", run_on_startup=True,    # run_on_startup recommended to stay False in production
              use_monitor=False) 
def google_health_api(myTimer: func.TimerRequest) -> None:

    # Check if a deadline was missed
    if myTimer.past_due:
        logging.info('The timer is past due!')


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
        # Send request to Google and save response in google_response
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
    start_time = (now - datetime.timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")  # convert to stirng for Google Health API request

    # The header needs to show the token to prove authorization for data access 
    headers = {"Authorization": f"Bearer {access_token}"}
    # Filtering parameters for the GET request
    params = {"filter": f'steps.interval.start_time >= "{start_time}"'}
    steps_url = "https://health.googleapis.com/v4/users/me/dataTypes/steps/dataPoints"

    try : 
        steps_response = requests.get(steps_url, headers=headers, params=params)
        steps_response.raise_for_status()
        
        data_points = steps_response.json().get("dataPoints", [])  # get is used so an empty list can be returned in case the value doesn't exist
        hourly_steps = 0
        for data_point in data_points: 
            hourly_steps += int(data_point['steps']['count'])
        print("hourly steps:", hourly_steps)

    except Exception as e: 
        logging.error(f"Steps data request failed: {e}")
        return
