import os
from fastapi import FastAPI
from app.api import health, regions, varieties, assessments, water_risk, reports # <-- Added reports
from app.database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EARTHSCOPE API",
    description="NASA Space Apps Challenge: Goa Rice & Water-Risk Intelligence",
    version="0.1.0"
)

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in origins],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Generate database tables on startup
Base.metadata.create_all(bind=engine)

# Include routers with API prefix
app.include_router(health.router, prefix="/api")
app.include_router(regions.router, prefix="/api")
app.include_router(varieties.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
app.include_router(water_risk.router, prefix="/api")
app.include_router(reports.router, prefix="/api")