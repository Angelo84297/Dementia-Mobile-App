from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from main import app
from db import get_session
import models
import pytest
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta, timezone

# used by mock database
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    # ensure the same database is shared by setup and endpoint
    poolclass=StaticPool,
)

def get_test_session():
    with Session(test_engine) as session: 
        yield session


@pytest.fixture
def client(): 
    """
    Simulates sending HTTP requests to FastAPI.
    """
    # override for testing. 
    app.dependency_overrides[get_session] = get_test_session
    SQLModel.metadata.create_all(test_engine)

    with TestClient(app) as client:
        yield client
    # at the end of each test
    SQLModel.metadata.drop_all(test_engine)
    app.dependency_overrides.clear()

@pytest.fixture
def session():
    """
    Provides a database session to manage interactions 
    with the mocked database. 
    """
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session: 
        yield session

    SQLModel.metadata.drop_all(test_engine)


def test_post_mood_endpoint(client, session): 

    # a patient is needed in the database
    patient= models.Patient(
        patient_id=2,
        user_id=1
    )
    session.add(patient)
    session.commit()

    response = client.post(
        "/mood/",
        json={
            "patient_id" : 2, 
            "mood": 3
        }
    )

    # 201 is returned in case of success
    assert response.status_code == 201
    mood_dict = response.json()
    assert mood_dict["mood"] == 3
    # ensure a mood id was generated
    assert isinstance(mood_dict["mood_id"], int)
    # ensure a datetime was generated
    assert mood_dict["created_at"] is not None 

def test_get_mood_endpoint(client, session): 

    patient = models.Patient(
        patient_id=5,
        user_id= 1
    )

    session.add(patient)
    session.commit()

    client.post(
        "/mood/",
        json={
            "patient_id" : 5, 
            "mood": 5
        })

    response = client.get(
        f"/mood/{5}/today",
        params={"timezone_name" : "Europe/London"},
    )

    assert response.status_code == 200
    json_data = response.json()
    assert len(json_data) == 1
    assert json_data[0]["mood"] == 5 
    assert isinstance (json_data[0]["mood_id"], int) 
    assert json_data[0]["created_at"] is not None

    # non existing patient
    response = client.get(
        f"/mood/{4}/today",
        params={"timezone_name" : "Europe/London"},
    )
    assert response.status_code == 404


def test_daily_healthsummary(client, session): 

    patient = models.Patient(
        patient_id=3,
        user_id= 1
    )

    session.add(patient)
    session.commit()

    health_record_1 = models.HealthRecord(
        patient_id = 3, hour_block = datetime.now(timezone.utc), 
        step_count = 50, average_heart_rate=100)
    health_record_2 = models.HealthRecord(
        patient_id = 3, hour_block = datetime.now(timezone.utc), 
        step_count = 250, average_heart_rate=120)
    health_record_3 = models.HealthRecord(
        patient_id = 3, hour_block = datetime.now(timezone.utc), 
        step_count = 550, average_heart_rate=60)

    # expected to be ignored since from yesterday
    health_record_4 = models.HealthRecord(
        patient_id = 3, 
        hour_block = datetime.now(timezone.utc) - timedelta(days=1), 
        step_count = 400, 
        average_heart_rate=120)

    # sleep session starting yesterday at 10:00 and ending today at 6:00 am
    start_sleep_1 = (
        datetime.now(
            timezone.utc) - timedelta(days=1)
        ).replace(hour=22, minute= 0)
    end_sleep_1 = start_sleep_1 + timedelta(hours= 8)

    sleep_session_1 = models.Sleep(
        patient_id= 3, 
        start_time = start_sleep_1, 
        end_time= end_sleep_1, 
        minutes_asleep= 380, 
        minutes_awake= 100)

    # sleep starting at 14:00 today
    start_sleep_2 = (datetime.now(timezone.utc)).replace(hour=14, minute= 0)
    end_sleep_2 = start_sleep_2 + timedelta(hours= 1)
    
    sleep_session_2 = models.Sleep(
        patient_id= 3, 
        start_time=start_sleep_2, 
        end_time=end_sleep_2, 
        minutes_asleep= 40, 
        minutes_awake= 20)

    session.add(health_record_1)
    session.add(health_record_2)
    session.add(health_record_3)
    session.add(sleep_session_1)
    session.add(sleep_session_2)
    session.add(health_record_4)
    session.commit()

    response = client.get(
        f"/healthsummary/{3}/today?timezone_name=Europe/London", 
    )

    assert response.status_code == 200
    record_dict = response.json()
    assert record_dict["total_step_count"] == 850
    assert record_dict["average_heart_rate"] == 93
    # the longest sleep session ending today is expected
    assert record_dict["max_sleep_minutes"] == 380