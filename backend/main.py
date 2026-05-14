import models
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from configs.db import lifespan
from controllers.user_controller import router as user_router
from controllers.login_controller import router as login_router
from controllers.room_controller import router as room_router
from controllers.booking_controller import router as booking_router


app = FastAPI(title="Last Game (SQLModel ORM + SQLite)", lifespan=lifespan)

app.include_router(user_router)
app.include_router(login_router)
app.include_router(room_router)
app.include_router(booking_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return{"ping":"pong"}
