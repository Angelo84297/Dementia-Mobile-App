from datetime import datetime, timedelta, timezone, UTC
from zoneinfo import ZoneInfo 
from fastapi import FastAPI, Depends, HTTPException
import psycopg2 
from psycopg2.extras import RealDictCursor
from db import database_url, create_db_and_tables, get_session
from sqlmodel import select, Session
from typing import List
import models
from google import genai
from google.genai.errors import ServerError
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


@app.get("/test-db-connection")
def test_db(): 
    try: 
        conn = psycopg2.connect(database_url)
        conn.close()
        return {"status" : "Connection was successful"}
    except Exception as e: 
        return {"status" : "Connection failed", 
                "error": str(e)}


@app.on_event("startup")
async def on_startup(): 
    create_db_and_tables() 


@app.post("/mood/")   
async def create_mood(mood: models.MoodInput, session: Session = Depends(get_session)):  
    """
    Endpoint storing a new mood log for the current user. 
    """
    new_mood = models.Mood(
        patient_id=mood.patient_id,  # mood is the object converted from the JSON body
        mood=mood.mood
    )
    session.add(new_mood)  
    session.commit()  
    session.refresh(new_mood) # update new_mood object with mood_id and created_at values
    return new_mood # return stored mood

def calculate_local_midnight(timezone_name : str): 
    now_utc = datetime.now(timezone.utc)
    user_timezone = ZoneInfo(timezone_name)
    now_local = now_utc.astimezone(user_timezone)
    local_midnight = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
    return local_midnight.astimezone(timezone.utc) # Convert back to UTC to match data stored in database

def calculate_six_hours_ago():    # in utc 0 
    now_utc = datetime.now(timezone.utc)
    return now_utc - timedelta(hours = 6)  

@app.get("/mood/{patient_id}/today", response_model = List[models.MoodRead])   # the response_model ensures the unnecessary data are dropped
def retrieve_mood(patient_id : int, timezone_name : str, session : Session = Depends(get_session)): 


    patient = session.get(models.Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    local_midnight = calculate_local_midnight(timezone_name= timezone_name)

    mood_list = session.exec(select(models.Mood).where(
        models.Mood.patient_id == patient_id, 
        models.Mood.created_at >= local_midnight)
        ).all()  
    
    for mood in mood_list: 
        ensure_timezone_info(mood.created_at)

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
        models.Sleep.end_time >= local_midnight   # to get today sleep sessions
    )).all()

    daily_record = {
        'total_step_count' : None,
        'average_heart_rate' : None, 
        'max_sleep_minutes' : None,
    }

    bpm_count = 0
    bpm_total = 0
    steps_total = 0

    for record in health_records: 
        steps_total += record.step_count
        if record.average_heart_rate is not None:
            bpm_total += record.average_heart_rate
            bpm_count += 1
    
    if bpm_total > 0:    # avoid 0/0 
        daily_record['average_heart_rate'] = round(bpm_total/bpm_count)  

    if steps_total > 0:   # ensures absence of data the front end receives null
        daily_record['total_step_count'] = steps_total

    max_minutes_asleep = 0

    daily_record['total_step_count'] 

    # find the longest sleep session of the day to display in UI. 
    for sleep_session in sleep_sessions:      
        if sleep_session.minutes_asleep > max_minutes_asleep: 
            max_minutes_asleep = sleep_session.minutes_asleep

    if max_minutes_asleep > 0: 
        daily_record['max_sleep_minutes'] = max_minutes_asleep
        
    return daily_record

@app.post("/patients/{patient_id}/wellbeingadvice/", response_model= models.WellbeingAdviceRead)
async def generate_wellbeing_advice(patient_id :int, timezone_name : str, session : Session = Depends(get_session)):  # async is used so the server can handle other requests while waiting for a response
    """
    A function to return AI wellbeing advice based on the user's data. 
    The function checks whether an existing advice not older than six hours
    is present in the database before prompting Gemini to generate a new one. 
    """
    
    existing_advice = session.exec(select(models.WellbeingAdvice).where(
        models.WellbeingAdvice.patient_id == patient_id,
        models.WellbeingAdvice.created_at >= calculate_six_hours_ago() 
    )
    .order_by(models.WellbeingAdvice.created_at.desc())
    ).first()

    if existing_advice != None : 
        return ensure_timezone_info(existing_advice)

    else : 
    
        gemini_payload = build_gemini_payload(patient_id=patient_id, timezone_name=timezone_name, session=session)

        #Delimiters were used to separate different parts of the prompt as recommended in Gemini documentation. 
        prompt = f"""You are a supportive wellbeing companion for users suffering from dementia. Analyse the following user's health data and accordingly provide wellbeing advice. 

        <patient_health_context>     
        {gemini_payload}
        </patient_health_context>

        The minimum mood value, 1 corresponds to "Awful" and 5, the maximum, corresponds to "Super"
        Provide maximum 3 concise reccomendations. 
        Do not act as a doctor (e.g. diagnosing the user, recommending drugs). 
        The user won't be able to reply. """

        # Gemini API call
        try: 
            response = await genai_client.aio.models.generate_content(
                model="gemini-3.5-flash",
                contents= prompt
            )

        except ServerError:
            raise HTTPException(
                status_code=503,
                detail= 'Gemini is temporarily unavailable, Please try again later.'
            )

        # other unexpected Gemini errors
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=str(e)
            )
 
        new_advice = models.WellbeingAdvice(
            patient_id = patient_id, 
            content = response.text,
        )
        session.add(new_advice)
        session.commit() 
        session.refresh(new_advice) 
        return ensure_timezone_info(new_advice)

@app.get("/task/{patient_id}", response_model=List[models.TaskRead])
def retrieve_task_list(patient_id :int, session : Session = Depends(get_session)): 
    
    task_list = session.exec(select(models.Task).where(
        models.Task.patient_id == patient_id)
        ).all()  

    for task in task_list: 
        ensure_timezone_info(task.notification_time)

    return task_list   

@app.post("/task/")
def store_task(task: models.TaskInput, session : Session = Depends(get_session)): 

    new_task = models.Task(
        patient_id=task.patient_id,  
        description=task.description,
        notification_time=task.notification_time,
        frequency=task.frequency,
        weekday=task.weekday
    )
    session.add(new_task)   
    session.commit() 
    session.refresh(new_task)  
    return new_task 

@app.delete("/patients/{patient_id}/tasks/{task_id}")
def delete_task(patient_id: int, task_id: int, session : Session = Depends(get_session)): 

    task = session.get(models.Task, task_id)

    if task is None: 
        raise HTTPException(status_code=404, detail="Task not found")   # let the client know if the task to delete can't be found

    session.delete(task)
    session.commit()

def build_gemini_payload(patient_id, timezone_name : str, session: Session):  

    local_midnight = calculate_local_midnight(timezone_name)  # format utc 0

    # fetch today health records starting from local midnight
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

    mood_records = session.exec(
        select(models.Mood).where(
            models.Mood.patient_id == patient_id,
            models.Mood.created_at >= local_midnight
    )).all()
    
    hourly_list = []
    sleep_list = []
    mood_list = []

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
            min_awake=sleep_record.minutes_awake,     # minutes awake included to give information about the quality sleep
            min_asleep=sleep_record.minutes_asleep
        ))

    for mood_record in mood_records:
        mood_list.append(models.MoodRead(
                mood_id = mood_record.mood_id,
                mood = mood_record.mood,
                created_at = convert_to_local(mood_record.created_at, timezone_name)
        ))

    payload = models.GeminiPayload(hourly_activity = hourly_list, sleep_sessions = sleep_list, mood_list=mood_list)


    # convert to JSON string to add in Gemini prompt. 
    return payload.model_dump_json(indent=2)  #Indent = 2 used for readability

def convert_to_local(datetime_input, timezone_name):   
    # add timezone info as it's not stored in the db 
    utc_datetime = datetime_input.replace(tzinfo=UTC)
    # return datetime converted to local time
    return utc_datetime.astimezone(ZoneInfo(timezone_name))

def ensure_timezone_info(datetime):
    """
    A helper function adding timezone information utc 0 
    if it was lost when data was saved in MySQL database. 
    """
    if datetime.tzinfo is not None:
        return datetime
    else :
        return datetime.replace(tzinfo=timezone.utc)