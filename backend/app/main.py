import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .expense_tracker.routes import (
    budget_routes,
    chart_routes,
    dashboard_routes,
    expense_routes,
    export_routes,
    insight_routes,
    ml_routes,
)
from .routers import auth, calendar, dashboard, notifications, tasks, time_management
from .schemas import HealthResponse

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app_name = os.getenv("APP_NAME", "Task Flow")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(
    title=f"{app_name} API",
    description="Backend API for the Task Flow task-management application.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(expense_routes.router, prefix="/api")
app.include_router(dashboard_routes.router, prefix="/api")
app.include_router(budget_routes.router, prefix="/api")
app.include_router(insight_routes.router, prefix="/api")
app.include_router(ml_routes.router, prefix="/api")
app.include_router(export_routes.router, prefix="/api")
app.include_router(chart_routes.router, prefix="/api")
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
