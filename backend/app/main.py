import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import calendar, dashboard, notifications, tasks, time_management
from .schemas import HealthResponse

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app_name = os.getenv("APP_NAME", "TaskFlow")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title=f"{app_name} API",
    description="Backend API for the TaskFlow task-management application.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(calendar.router, prefix="/api")
app.include_router(time_management.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")


@app.get("/", response_model=HealthResponse)
def root():
    return {"status": "ok", "app": app_name}


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok", "app": app_name}
