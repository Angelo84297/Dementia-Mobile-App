import logging
import os
import requests


def get_access_token() -> str: 
    """
    Requests a new Google access token using the Google refresh token. 

    Returns: 
        The Google access token. 
    """
    client_id = os.environ["GOOGLE_CLIENT_ID"]
    client_secret = os.environ["GOOGLE_CLIENT_SECRET"]
    # allows token automatic renew avoiding the user having to consent.
    refresh_token = os.environ["GOOGLE_REFRESH_TOKEN"]  

    # Google OAuth authorization endpoint to which credentials are sent to. 
    token_url =  "https://oauth2.googleapis.com/token"
    token_payload = {
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token"
    }

    try: 
        google_response = requests.post(token_url, data=token_payload)
        google_response.raise_for_status()
        return google_response.json()['access_token']

    except Exception as e: 
        logging.error(f"Access token request failed: {e}")
        raise  
