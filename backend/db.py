from sqlmodel import SQLModel, create_engine
import models # needed so create_all() knows which tables to create

postgresql_url = "postgresql://postgres:NnzEtTj:u0,g@localhost:5432/supporting_others_db" 

engine = create_engine(postgresql_url, echo=True)  # with echo all the sql statements are printed


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)  # takes the engine and uses it to create all tables in metadata
