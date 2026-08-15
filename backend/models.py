"""
Data model classes. 
"""
from sqlmodel import Column, Field, SQLModel, Text, UniqueConstraint
from datetime import datetime, timezone
from typing import List

class Users(SQLModel, table=True):  
    user_id: int | None = Field(default=None, primary_key=True)
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None 
    role: str | None = Field(
        default = None, # for the MVP is not important
        description="patient/caregiver.") 
    address: str | None = None

class Patient(SQLModel, table=True): 
    patient_id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.user_id")
    age: int | None = None

class HealthRecord(SQLModel, table=True):   
    record_id: int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.patient_id")
    hour_block: datetime = Field(
        # MySQL does not store the timezone information
        default_factory=lambda: datetime.now(timezone.utc), 
        description="The hour aggregating the health record data.") 
    step_count: int 
    average_heart_rate: int | None = None
    __table_args__ = (
        UniqueConstraint("patient_id", "hour_block"),  # avoids data duplication
    )

class Mood(SQLModel, table=True): 
    mood_id: int | None = Field(default=None, primary_key=True) 
    patient_id: int = Field(foreign_key="patient.patient_id")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)) 
    mood: int = Field(
        ge=1, le=5, description="Mood value from 1 (Awful) to 5 (Super).")
    
class Sleep(SQLModel, table=True): 
    sleep_id: int | None = Field(default=None, primary_key=True) 
    patient_id: int = Field(foreign_key="patient.patient_id")
    start_time: datetime 
    end_time: datetime
    minutes_asleep: int
    minutes_awake: int = Field(
        description="The duration in minutes the patient was awake during " \
        "a sleep session. It gives indication of the sleep quality. ")
    __table_args__ = (
        UniqueConstraint("patient_id", "start_time"),  
    )

class WellbeingAdvice(SQLModel, table=True):
    advice_id: int | None = Field(default=None, primary_key=True) 
    patient_id: int = Field(foreign_key="patient.patient_id")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)) # utc is lost in db
    content: str = Field(
        # Text is sufficient for the Gemini response length
        sa_column=Column(Text))

class Task(SQLModel, table=True): 
    task_id : int | None = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.patient_id")
    description: str 
    notes : str | None = None   # currently not implemented
    notification_time: datetime
    frequency : str = Field(description="daily/weekly.")
    status : str | None = None  # currently not implemented
    weekday : int | None = Field(
        default=None, 
        ge=1, 
        le=7,
        description= "Scheduled day for the task. 1 represents Sunday "
        "and 7 represents Saturday. Defaults to None for daily frequency.") 

class TaskRead(SQLModel):  
    task_id : int 
    description: str  
    notification_time: datetime
    frequency : str = Field(description="daily/weekly.")
    weekday : int | None = Field(
        description= "Day of the task. 1 represents Sunday "
        "and 7 represents Saturday. Defaults to None for daily frequency.") 

class TaskInput(SQLModel): 
    patient_id: int
    description: str    
    notification_time: datetime 
    frequency : str  = Field(description="daily/weekly.")
    weekday: int | None = Field(
        default=None, 
        description= "Day of the task. 1 represents Sunday "
        "and 7 represents Saturday. Defaults to None for daily frequency.") 

class MoodInput(SQLModel):
    patient_id : int 
    mood: int = Field(
        ge=1, le=5, description="Mood value from 1 (Awful) to 5 (Super).")

class MoodRead(SQLModel):  
    mood_id : int
    mood: int = Field(
        ge=1, le=5, description="Mood value from 1 (Awful) to 5 (Super).")
    created_at: datetime

class DailyHealthRecordRead(SQLModel): 
    total_step_count : int | None  
    average_heart_rate : int | None 
    max_sleep_minutes : int | None = Field(
        description="The duration in minutes of the " \
        "longest sleeps session today.")

class WellbeingAdviceRead(SQLModel):
    content : str 
    created_at : datetime   

class SleepSession(SQLModel): 
    start_time : datetime
    end_time : datetime
    min_awake : int = Field(
        description="The duration in minutes the patient was awake during " \
        "a sleep session. It gives indication of the sleep quality. ")
    min_asleep : int 

class HourlyActivity(SQLModel): 
    hour_block:  datetime = Field(
        description="The hour aggregating the health record data.")
    avg_heart_rate : int | None
    step_count : int 

class GeminiPayload(SQLModel): 
    hourly_activity: List[HourlyActivity] 
    sleep_sessions: List[SleepSession] 
    mood_list: List[MoodRead] 

