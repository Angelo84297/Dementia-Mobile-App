from datetime import datetime, timezone
from zoneinfo import ZoneInfo 

from fastapi import FastAPI, Depends
import psycopg2 
from psycopg2.extras import RealDictCursor
from db import database_url, create_db_and_tables, get_session
from sqlmodel import select, Session
from typing import List
import models

app = FastAPI()


def get_db_connection(): 
    try: 
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)  # with RealDictCursor each row is returned as a dictionary
        return conn 
    except Exception as e:
        print("Connection to the database failed. Error:", e)
        return None


"""
Defining endpoint. Tells FastAPI when to call root(). 
When A HTTP GET request is sent to / the function root() is automatically called. 
"/" is the base URL of the API. 
"""
@app.get("/")
async def root():    # asynch is used to handle network requests
    return {"message": "Hello World"}   # dictionary is automatically converted in JSON by FFastAPI


@app.get("/test-db-connection")
def test_db(): 
    try: 
        conn = psycopg2.connect(database_url)
        conn.close()
        return {"status" : "Connection was successful"}
    # catch the specific exception and print it. 
    except Exception as e: 
        return {"status" : "Connection failed", 
                "error": str(e)}


@app.get("/api/test-users") # returns all the users in the users table
def test_users(session: Session = Depends(get_session)):  # inject dependency
    users = session.exec(select(models.User)).all()
    return {"users": users}


@app.on_event("startup")
async def on_startup(): # triggered when the FastAPI app is started
    create_db_and_tables() 

"""
Endpoint storing a new mood log for the current user. 
"""
@app.post("/mood/")   
async def create_mood(mood: models.MoodInput, session: Session = Depends(get_session)):  
    new_mood = models.Mood(
        patient_id=mood.patient_id,  # mood is the object converted from the JSON body
        mood=mood.mood
    )
    session.add(new_mood)  # add created mood to current session
    session.commit()  # write the mood record in the db 
    session.refresh(new_mood) # update new_mood object with mood_id and created_at values
    return new_mood # return stored mood

def start_user_day(timezone_name : str): 

    # Calculate now in UTC
    now_utc = datetime.now(timezone.utc)
    # Calculate user's timezone
    user_timezone = ZoneInfo(timezone_name)
    # Convert utc in user local time
    now_local = now_utc.astimezone(user_timezone)
    # Calculate user's midnight
    local_midnight = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    # Convert back to UTC to match database
    return local_midnight.astimezone(timezone.utc)


@app.get("/mood/{patient_id}/today", response_model = List[models.MoodRead])   # {patient_id} is used to find mood list of a specific patient
async def retrieve_mood(patient_id : int, timezone_name : str, session : Session = Depends(get_session)): 
    # Calculate local midnight
    local_midnight = start_user_day(timezone_name= timezone_name)
    # Query the table retrieving mood list 
    mood_list = session.exec(select(models.Mood).where(
        # Filter results depending on patient id
        models.Mood.patient_id == patient_id, 
        # Only show results for today
        models.Mood.created_at >= local_midnight)
        ).all()  
    
    for mood in mood_list: 
        # Check if timezone info was lost when created at was saved in database. 
        if mood.created_at.tzinfo is None: 
            # Add missing timezone information. Needed by UI to convert to local time. 
            mood.created_at = mood.created_at.replace(tzinfo=timezone.utc)

    return mood_list