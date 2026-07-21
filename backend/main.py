from datetime import datetime, timezone, UTC
from zoneinfo import ZoneInfo 
from fastapi import FastAPI, Depends
import psycopg2 
from psycopg2.extras import RealDictCursor
from db import database_url, create_db_and_tables, get_session
from sqlmodel import select, Session
from typing import List
import models
from google import genai
import os
from dotenv import load_dotenv


app = FastAPI()

# load environment variables from .env 
load_dotenv()

genai_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

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

def calculate_local_midnight(timezone_name : str): 
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
def retrieve_mood(patient_id : int, timezone_name : str, session : Session = Depends(get_session)): 
    # Calculate local midnight
    local_midnight = calculate_local_midnight(timezone_name= timezone_name)
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

@app.get("/healthsummary/{patient_id}/today")
def retrieve_daily_health_record(patient_id: int, timezone_name : str, session : Session = Depends(get_session)): 

    local_midnight = calculate_local_midnight(timezone_name= timezone_name)


    health_records = session.exec(select(models.HealthRecord).where(
        models.HealthRecord.patient_id == patient_id, 
        models.HealthRecord.hour_block >= local_midnight
    )).all()

    sleep_sessions = session.exec(select(models.Sleep).where(
        models.Sleep.patient_id == patient_id, 
        models.Sleep.end_time >= local_midnight    # fetch all the sleep sessions ending after local midnight
    )).all()

    daily_record = {
        'total_step_count' : 0,
        'average_heart_rate' : None, 
        'max_sleep_minutes' : None,
    }

    bpm_count = 0
    bpm_total = 0

    for record in health_records: 
        daily_record['total_step_count'] += record.step_count
        if record.average_heart_rate is not None:
            bpm_total += record.average_heart_rate
            bpm_count += 1
    
    if bpm_total > 0:    # avoid 0/0 
        daily_record['average_heart_rate'] = round(bpm_total/bpm_count)  

    max_minutes_asleep = 0

    for sleep_session in sleep_sessions:      # find the longest sleep session of the day to display in UI
        if sleep_session.minutes_asleep > max_minutes_asleep: 
            max_minutes_asleep = sleep_session.minutes_asleep

    if max_minutes_asleep > 0: 
        daily_record['max_sleep_minutes'] = max_minutes_asleep
        
    return daily_record

@app.post("/wellbeingadvice/{patient_id}")
async def generate_wellbeing_advice(patient_id :int, timezone_name : str, session : Session = Depends(get_session)):  # async is used so the server can handle other requests while waiting for a response
    
    
    gemini_payload = build_gemini_payload(patient_id=patient_id, timezone_name=timezone_name, session=session)

    prompt = f"""You are a supportive health and wellness companion. Analyse this dementia patient's health data and provide wellbeing advice. 

    <patient_health_context> 
    {gemini_payload}
    </patient_health_context>

    Based on the this data provide 2-3 reccomendations. Do not diagnose the patient."""

    # Gemini API call
    response = await genai_client.aio.models.generate_content(
        model="gemini-3.5-flash",
        contents= prompt
    )

    return {"advice" : response.text}

@app.get("/task/{patient_id}")
def retrieve_task_list(patient_id :int, session : Session = Depends(get_session)): 
    
    task_list = session.exec(select(models.Task).where(
        models.Task.patient_id == patient_id)
        ).all()  

    return task_list


def build_gemini_payload(patient_id, timezone_name : str, session: Session):  

    # fetch patient's age for more context

    # local midnight in database format (utc 0) 
    local_midnight = calculate_local_midnight(timezone_name)   

    # fetch today health records
    health_records = session.exec(
        select(models.HealthRecord).where(
            models.HealthRecord.patient_id == patient_id,
            models.HealthRecord.hour_block >= local_midnight
        )
    ).all()

    # fetch all the sleep sessions ending today
    sleep_records = session.exec(
        select(models.Sleep).where(
            models.Sleep.patient_id == patient_id,
            models.Sleep.end_time >= local_midnight
    )).all()
    
    hourly_list = []
    sleep_list = []

    for health_record in health_records: 
        hourly_list.append(models.HourlyActivity(
            # time is converted to local to give Gemini better context
            hour_block=convert_to_local(health_record.hour_block, timezone_name), 
            avg_heart_rate=health_record.average_heart_rate, 
            step_count=health_record.step_count))
        
    for sleep_record in sleep_records: 
        sleep_list.append(models.SleepSession(
            start_time=convert_to_local(sleep_record.start_time, timezone_name),
            end_time=convert_to_local(sleep_record.end_time, timezone_name),
            min_awake=sleep_record.minutes_awake,
            min_asleep=sleep_record.minutes_asleep
        ))

    payload = models.GeminiPayload(hourly_activity = hourly_list, sleep_sessions = sleep_list)
    # print for debugging
    print(payload.model_dump_json(indent=2))

    # convert to JSON string to add in Gemini prompt. Indent = 2 used for readability
    return payload.model_dump_json(indent=2)

def convert_to_local(datetime_input, timezone_name): 
    # add timezone info as it's not stored in the db 
    utc_datetime = datetime_input.replace(tzinfo=UTC)
    # return datetime converted to local time
    return utc_datetime.astimezone(ZoneInfo(timezone_name))