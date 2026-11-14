from fastapi import FastAPI
from app.api import health, regions, varieties, assessments, water_risk, reports # <-- Added reports

app = FastAPI(
    title="EARTHSCOPE API",
    description="NASA Space Apps Challenge: Goa Rice & Water-Risk Intelligence",
    version="0.1.0"
)

# Include routers with API prefix
app.include_router(health.router, prefix="/api")
app.include_router(regions.router, prefix="/api")
app.include_router(varieties.router, prefix="/api")
app.include_router(assessments.router, prefix="/api")
app.include_router(water_risk.router, prefix="/api")
app.include_router(reports.router, prefix="/api")