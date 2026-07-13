
import logging
import os
import requests


def get_access_token(): 
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
        return google_response.json()['access_token']

    except Exception as e: 
        logging.error(f"Access token request failed: {e}")
        raise   # execution is stopped if an access token is not received
