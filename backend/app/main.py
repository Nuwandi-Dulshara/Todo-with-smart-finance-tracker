from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.core.config import settings

app = FastAPI(
    title="Organix AI API",
    version="1.0.0",
    description="Backend API for Organix AI",
)

allowed_origins = [settings.FRONTEND_URL]
if settings.APP_ENV.lower() == "development":
    allowed_origins.extend(
        [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
        ]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(allowed_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "ok",
        "service": "Organix AI API",
    }