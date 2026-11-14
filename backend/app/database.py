from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Creates a local SQLite file named earthscope.db
SQLALCHEMY_DATABASE_URL = "sqlite:///./earthscope.db"

# connect_args={"check_same_thread": False} is required only for SQLite in FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get the database session in our endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()