from sqlmodel import SQLModel, Session, create_engine
import models # used by create_all() to create classes
import os
from dotenv import load_dotenv

load_dotenv()  
database_url = os.getenv("database_url")   

# object in charge of communicating with the database. 
engine = create_engine(database_url, echo=True) 


def create_db_and_tables():
    """
    Creates tables in the database from the data model classes.
    """
    SQLModel.metadata.create_all(engine)  

def get_session():
    """
    Provides a database session to to manage interactions with the database.
    """
    with Session(engine) as session:
        yield session    # Closes session automatically when no longer needed. 
