# Meeting Room Booking System

A Meeting Room Booking System developed with **Next.js** for the Frontend and **FastAPI** for the Backend, using **SQLModel (SQLite)** for database management.

## 🚀 Tech Stack

### Frontend
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Components:** Radix UI & Lucide React
- **Calendar:** FullCalendar
- **State Management/API:** Axios & JWT Decode

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **ORM:** [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
- **Database:** SQLite
- **Authentication:** JWT (JSON Web Token)

---

## 📂 Project Structure

```text
meeting-room-booking/
├── backend/                # FastAPI Application
│   ├── configs/            # Database & App configurations
│   ├── controllers/        # API Routes (User, Room, Booking, Login)
│   ├── models/             # SQLModel Database Models
│   ├── schemas/            # Pydantic Schemas
│   ├── utils/              # Helper functions
│   └── main.py             # Entry point
├── frontend/               # Next.js Application
│   ├── app/                # Next.js App Router (Pages)
│   ├── components/         # Reusable UI Components
│   ├── hooks/              # Custom React Hooks
│   ├── lib/                # Utility libraries (Axios, Utils)
│   └── public/             # Static assets
└── README.md
```

---

## 🛠️ Getting Started

### 1. Backend Setup (FastAPI)

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the required libraries:
   ```bash
   pip install fastapi uvicorn sqlmodel pydantic-settings python-jose[cryptography] passlib[bcrypt]
   ```
3. Run the Server:
   ```bash
   python main.py
   ```
   *The backend will be running at: `http://127.0.0.1:8000`*

### 2. Frontend Setup (Next.js)

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (pnpm is recommended):
   ```bash
   pnpm install
   ```
3. Run the project in Development Mode:
   ```bash
   pnpm dev
   ```
   *The frontend will be running at: `http://localhost:3000`*

---

## ✨ Key Features

- **User Authentication:** Registration and Login system using JWT.
- **Room Management:** Manage meeting room information (Add/Edit/Delete).
- **Booking System:** Meeting room booking system with a calendar view (FullCalendar).
- **Dashboard:** Summary of bookings and various statuses.
- **Responsive Design:** Optimized for both Desktop and Mobile devices.

---

## 📝 API Details (Backend Routers)

- `/users`: Manage user data.
- `/login`: Authentication system.
- `/rooms`: Manage meeting room data.
- `/bookings`: Manage meeting room bookings.
- `/health`: Check server status.

