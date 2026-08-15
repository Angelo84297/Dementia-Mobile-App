from datetime import datetime, timedelta, timezone, UTC
from zoneinfo import ZoneInfo
from fastapi import FastAPI, Depends, HTTPException, status
from db import database_url, create_db_and_tables, get_session
from sqlmodel import select, Session
from typing import List
import models
from google import genai
from google.genai.errors import ServerError
import os
from dotenv import load_dotenv
from typing import List


app = FastAPI(
    title="AI-Assisted Dementia Wellbeing Mobile Application"
)

load_dotenv()
genai_client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

@app.on_event("startup")
async def on_startup(): 
    """
    Creates tables in the database from the data model classes.  
    This endpoint is currently deprecated and will be replaced in 
    future versions. 
    """
    create_db_and_tables() 


@app.post(
    "/mood/", status_code=status.HTTP_201_CREATED, 
    response_model=models.MoodRead)  # ensures the unnecessary data are dropped
def create_mood(mood: models.MoodInput, 
                session: Session = Depends(get_session)) -> models.MoodRead:  
    """
    Stores a new mood for an existing patient. 

    Raises:
        404: if the patient id does not exist. 
    """
    ensure_patient_exists(mood.patient_id, session)

    new_mood = models.Mood(
        patient_id=mood.patient_id,  
        mood=mood.mood
    )
    session.add(new_mood)  
    session.commit()  
    session.refresh(new_mood) 
    return new_mood 

def calculate_local_midnight(timezone_name: str) -> datetime: 
    """
    Calculates midnight of a given timezone. 

    Args: 
        timezone_name: IANA timezone name (e.g. Europe/London)

    Returns: 
       the local midnight converted in UTC 0
    """
    now_utc = datetime.now(timezone.utc)
    user_timezone = ZoneInfo(timezone_name)
    now_local = now_utc.astimezone(user_timezone)
    local_midnight = now_local.replace(
        hour=0, minute=0, second=0, microsecond=0)
    return local_midnight.astimezone(timezone.utc) 

def calculate_six_hours_ago() -> datetime:    
    """
    Subtracts 6 hours from the current time and 
    returns the result in UTC 0. 

    Returns:
        6 hours ago in UTC 0.  
    """
    now_utc = datetime.now(timezone.utc)
    return now_utc - timedelta(hours = 6)  

def ensure_patient_exists(patient_id: int, session: Session):
    """
    Checks whether a patient id exists in the database. 

    Args: 
        patient_id: the ID of the patient
        session: the current database session. 

    Raises: 
        404: if the patient id is not found. 
    """
    patient = session.get(models.Patient, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

def get_today_mood_list(session: Session, patient_id: int, 
                        local_midnight: datetime) -> List[models.Mood]: 
    """
    Returns the user's daily mood list. 

    Args: 
        session: the current database session. 
        patient_id: the ID of the patient. 
        local_midnight: the user's midnight in UTC 0. 

    Returns: 
        a list of today mood objects.
    """
    mood_list = session.exec(select(models.Mood).where(
            models.Mood.patient_id == patient_id, 
            models.Mood.created_at >= local_midnight)
            ).all() 
    return mood_list

def get_today_health_records(
        session: Session, patient_id: int, 
        local_midnight: datetime) -> List[models.HealthRecord]: 
    """
    Returns the user's hourly health records of the current day. 

    Args: 
        session: the current database session. 
        patient_id: the ID of the patient. 
        local_midnight: the user's midnight in UTC 0. 

    Returns: 
        a list of hourly health record objects from the current day. 
    """
    health_records = session.exec(select(models.HealthRecord).where(
        models.HealthRecord.patient_id == patient_id, 
        models.HealthRecord.hour_block >= local_midnight
    )).all()

    return health_records

def get_today_sleep_sessions(
        session: Session, patient_id: int, 
        local_midnight: datetime) -> List[models.SleepSession]:
    """
    Returns the user's sleep sessions ending after local midnight.

    Args: 
        session: the current database session. 
        patient_id: the ID of the patient. 
        local_midnight: the user's midnight in UTC 0. 

    Returns: 
        a list of sleep session objects from the current day. 
    """

    sleep_sessions = session.exec(select(models.Sleep).where(
        models.Sleep.patient_id == patient_id, 
        models.Sleep.end_time >= local_midnight  
    )).all()
    return sleep_sessions

@app.get("/mood/{patient_id}/today", response_model = List[models.MoodRead])  
def retrieve_mood(
    patient_id : int, timezone_name : str, 
    session : Session = Depends(get_session)) -> List[models.MoodRead]: 
    """
    Returns a list of moods logged during the current day. 

    Raises:
        404: if the patient id does not exist. 
    """

    ensure_patient_exists(patient_id, session)
    local_midnight = calculate_local_midnight(timezone_name)
    mood_list = get_today_mood_list(session, patient_id, local_midnight)
    
    for mood in mood_list: 
        mood.created_at = ensure_timezone_info(mood.created_at)

    return mood_list

@app.get("/healthsummary/{patient_id}/today", 
         response_model=models.DailyHealthRecordRead)
def retrieve_daily_health_record(
    patient_id: int, timezone_name : str, 
    session : Session = Depends(get_session)) -> models.DailyHealthRecordRead: 
    """
    Returns a summary of the patient's daily health records, 
    including sleep time, total step count, average heart rate.
    For sleep time the longest daily sleep session is returned. 

    Raises:
        404: if the patient id does not exist.  
    """

    ensure_patient_exists(patient_id, session)
    local_midnight = calculate_local_midnight(timezone_name= timezone_name)
    health_records = get_today_health_records(
        session, patient_id, local_midnight)
    sleep_sessions = get_today_sleep_sessions(
        session, patient_id, local_midnight)

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
    
    if bpm_count > 0:    # avoid 0/0 
        daily_record['average_heart_rate'] = round(bpm_total/bpm_count)  

    if steps_total > 0:   # to return null in absence of data
        daily_record['total_step_count'] = steps_total

    max_minutes_asleep = 0

    # find the longest sleep session of the day 
    for sleep_session in sleep_sessions:      
        if sleep_session.minutes_asleep > max_minutes_asleep: 
            max_minutes_asleep = sleep_session.minutes_asleep

    if max_minutes_asleep > 0: 
        daily_record['max_sleep_minutes'] = max_minutes_asleep
        
    return daily_record

@app.post("/patients/{patient_id}/wellbeingadvice/", 
          response_model= models.WellbeingAdviceRead)
async def generate_wellbeing_advice( # async as Gemini may take more time. 
    patient_id :int, timezone_name : str, 
    session : Session = Depends(get_session)) -> models.WellbeingAdviceRead:  
    """
    Returns AI wellbeing advice based on the user's health data. 
    Checks whether an advice not older than six hours
    is present in the database before prompting Gemini to generate a new one. 

    Raises: 
        404: if the patient id is not found. 
        503: if Gemini is temporarily unavailable. 
        500: any unexpected Gemini issue. 
    """

    ensure_patient_exists(patient_id, session)
    
    existing_advice = session.exec(select(models.WellbeingAdvice).where(
        models.WellbeingAdvice.patient_id == patient_id,
        models.WellbeingAdvice.created_at >= calculate_six_hours_ago() 
    )
    .order_by(models.WellbeingAdvice.created_at.desc())
    ).first()

    if existing_advice is not None:
        existing_advice.created_at = ensure_timezone_info(
            existing_advice.created_at)
        return existing_advice

    else:
        gemini_payload = build_gemini_payload(
            patient_id=patient_id, timezone_name=timezone_name, 
            session=session)

        #Delimiters recommended in Gemini documentation
        prompt = f"""You are a supportive wellbeing companion for users 
        suffering from dementia. Analyse the user's health data and provide 
        wellbeing advice. 

        <patient_health_context>     
        {gemini_payload}
        </patient_health_context>

        The minimum mood value is 1 ("Awful") and 5 is the maximum("Super")
        Provide 3 concise reccomendations. 
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
                detail= 'Gemini is temporarily unavailable. ' \
                'Please try again later.'
            )

        except Exception:
            raise HTTPException(
                status_code=500,
                detail= 'Gemini encountered unexpected issues. ' \
                'Please try again later.'
            )
 
        new_advice = models.WellbeingAdvice(
            patient_id = patient_id, 
            content = response.text,
        )
        session.add(new_advice)
        session.commit() 
        session.refresh(new_advice) 
        new_advice.created_at = ensure_timezone_info(new_advice.created_at)
        return new_advice

@app.get("/task/{patient_id}", response_model=List[models.TaskRead])
def retrieve_task_list(
    patient_id :int, 
    session : Session = Depends(get_session)) -> List[models.TaskRead]: 
    """
    Returns a list of daily mood records for a patient. 
    
    Raises:
        404: if the patient doesn't exist. 
    """

    ensure_patient_exists(patient_id, session)
    
    task_list = session.exec(select(models.Task).where(
        models.Task.patient_id == patient_id)
        ).all()  

    for task in task_list: 
        task.notification_time = ensure_timezone_info(task.notification_time)

    return task_list   

@app.post("/task/", 
          status_code=status.HTTP_201_CREATED, 
          response_model=models.TaskRead)
def store_task(task: models.TaskInput, 
               session : Session = Depends(get_session)) -> models.TaskRead: 
    """
    Stores a new task for the patient. 

    Raises:
        404: if the patient id is not found.
    """

    ensure_patient_exists(task.patient_id, session)
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

@app.delete("/patients/{patient_id}/tasks/{task_id}", 
            status_code=status.HTTP_204_NO_CONTENT) # to signal success
def delete_task(patient_id: int, task_id: int, 
                session : Session = Depends(get_session)): 
    """
    Deletes a user's task. 

    Raises:
        404: if the patient id or tasks are not found, 
        or if the patient id doesn't match the tasks' patient 
        id. 
    """

    ensure_patient_exists(patient_id, session)

    task = session.get(models.Task, task_id)

    if task is None: 
        raise HTTPException(status_code=404, detail="Task not found")   
    
    if task.patient_id != patient_id:  
        raise HTTPException(status_code=404, detail="Task not found")
    
    session.delete(task)
    session.commit()

def build_gemini_payload(
        patient_id: int, timezone_name : str, session: Session) -> str:  
    """
    Builds the payload to be sent to Gemini with the
    user's hourly health records, sleep sessions and mood records
    from the current day. Time is converted to local time to give Gemini
    better context. 

    Args: 
        patient_id: the ID of the patient.
        timezone_name: IANA timezone name (e.g. Europe\London).
        session: the current database session.

    Returns:
        the payload to be sent to Gemini. 
    """

    local_midnight = calculate_local_midnight(timezone_name)  # format utc 0

    health_records = get_today_health_records(
        session, patient_id, local_midnight)
    sleep_records = get_today_sleep_sessions(
        session, patient_id, local_midnight)
    mood_records = get_today_mood_list(session, patient_id, local_midnight)
    
    hourly_list = []
    sleep_list = []
    mood_list = []

    for health_record in health_records: 
        hourly_list.append(models.HourlyActivity(
            hour_block=convert_to_local(
                health_record.hour_block, timezone_name), 
            avg_heart_rate=health_record.average_heart_rate, 
            step_count=health_record.step_count))
        
    for sleep_record in sleep_records: 
        sleep_list.append(models.SleepSession(
            start_time=convert_to_local(
                sleep_record.start_time, timezone_name),
            end_time=convert_to_local(sleep_record.end_time, timezone_name),
            min_awake=sleep_record.minutes_awake, # sleep quality info
            min_asleep=sleep_record.minutes_asleep
        ))

    for mood_record in mood_records:
        mood_list.append(models.MoodRead(
                mood_id = mood_record.mood_id,
                mood = mood_record.mood,
                created_at = convert_to_local(
                    mood_record.created_at, timezone_name)
        ))

    payload = models.GeminiPayload(
        hourly_activity = hourly_list, 
        sleep_sessions = sleep_list, mood_list=mood_list)

    return payload.model_dump_json(indent=2)  # Indent for readability

def convert_to_local(datetime_input: datetime, timezone_name: str) -> datetime:   
    """
    Converts a datetime to local time. 

    Args: 
        datetime_input: the datetime to convert. 
        timezone_name: the IANA timezone name (e.g Europe/London)
    
    Returns: 
        the converted datetime to local time. 
    """
    utc_datetime = ensure_timezone_info(datetime_input)
    return utc_datetime.astimezone(ZoneInfo(timezone_name))

def ensure_timezone_info(datetime: datetime) -> datetime:
    """
    Adds timezone information in UTC 0 if it was lost 
    when a datatime was saved in MySQL database. 
    """
    if datetime.tzinfo is not None:
        return datetime
    else :
        return datetime.replace(tzinfo=timezone.utc)



