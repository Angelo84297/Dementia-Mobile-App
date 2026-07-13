import logging
import requests

# Helper to fetch data points
def fetch_data_points(url, headers, params): 

    try : 
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()  # jump to except in case of error
        parsed = response.json()  # parsed here to avoid parsing twice later

        data_points = parsed.get("dataPoints", [])  # an empty list can be returned in case the value doesn't exist
        next_page_token = parsed.get("nextPageToken")    # if != None it means there is more data to be fetched. 

        # Keep sending get requests while a nextPageToken is returned. 
        # Since Google limits the amount of data sent for each request, this ensures all data is fetched. 
        while next_page_token: 
            params["pageToken"] = next_page_token  # tell cursor where to continue fetching data
            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            parsed = response.json()   
            data_points += parsed.get("dataPoints", [])   
            next_page_token = parsed.get("nextPageToken")

        return data_points
    
    except Exception as e: 
        logging.error(f"Data request failed: {e}")
        raise 