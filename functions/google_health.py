import logging
import requests

# Helper to fetch data points
def fetch_data_points(
        url: str , headers: dict[str, str] , 
        params: dict[str, str | int]) -> list: 
    """
    Fetches data points from Google Health API. 

    Args: 
        url: The API endpoint from which data points are fetched. 
        headers: The headers containing the access token.
        params: Query parameters used to filter the results. 

    Returns: 
        A list contaning the datapoints returned by the API. 

    Raises: 
        requests.RequestException: In case the API request fails. 
    """

    try : 
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  
        parsed = response.json()  # parsed here to avoid parsing twice later
        # return an empty list in case no dataPoints are found
        data_points = parsed.get("dataPoints", []) 
        next_page_token = parsed.get("nextPageToken")   

        # Keep sending get requests while a nextPageToken is returned. 
        # Ensures all data is fetched despite Google Health limit per request. 
        while next_page_token: 
            # tell cursor where to continue fetching data
            params["pageToken"] = next_page_token 
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            parsed = response.json()   
            data_points += parsed.get("dataPoints", [])   
            next_page_token = parsed.get("nextPageToken")

        return data_points
    
    except Exception as e: 
        logging.error(f"Data request failed: {e}")
        raise 