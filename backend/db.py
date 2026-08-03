from sqlmodel import SQLModel, Session, create_engine
import models # needed so create_all() knows which tables to create
import os
from dotenv import load_dotenv

load_dotenv()  # read .env file

database_url = os.getenv("database_url")   # retrieve url from env file


# object in charge of communicating with the database. Only one needed for the whole application. 
engine = create_engine(database_url, echo=True)  # with echo all the sql statements are printed

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)  # take the engine and use it to create all tables in metadata

"""
sessions are needed to manage interactions with the database (e.g. queries, insert data)
each request needs its own session
"""
def get_session():
    with Session(engine) as session:
        yield session    # yield is used so the session can be closed automatically at the end of the endpoint execution
