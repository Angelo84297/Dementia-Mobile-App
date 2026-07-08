import logging
import azure.functions as func
import requests
import os

app = func.FunctionApp()

"""
the function app is triggered every 30 seconds for testing purposes
"""
@app.timer_trigger(schedule="*/30 * * * * *", arg_name="myTimer", run_on_startup=True,    # run_on_startup recommended to stay False in production
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



    except Exception as e: 
        logging.error(f"Access token request failed: {e}")
        return
