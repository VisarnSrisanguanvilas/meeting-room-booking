# Meeting Room Booking System

ระบบจองห้องประชุม (Meeting Room Booking System) ที่พัฒนาด้วย **Next.js** สำหรับ Frontend และ **FastAPI** สำหรับ Backend พร้อมระบบจัดการฐานข้อมูลด้วย **SQLModel (SQLite)**

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

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

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

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

## 🛠️ วิธีการติดตั้งและรันโปรเจกต์ (Getting Started)

### 1. การตั้งค่า Backend (FastAPI)

1. เข้าไปที่โฟลเดอร์ `backend`:
   ```bash
   cd backend
   ```
2. ติดตั้ง Library ที่จำเป็น:
   ```bash
   pip install fastapi uvicorn sqlmodel pydantic-settings python-jose[cryptography] passlib[bcrypt]
   ```
3. รัน Server:
   ```bash
   python main.py
   ```
   *Backend จะรันอยู่ที่: `http://127.0.0.1:8000`*

### 2. การตั้งค่า Frontend (Next.js)

1. เข้าไปที่โฟลเดอร์ `frontend`:
   ```bash
   cd frontend
   ```
2. ติดตั้ง Dependencies (แนะนำให้ใช้ `pnpm`):
   ```bash
   pnpm install
   ```
3. รันโปรเจกต์ใน Development Mode:
   ```bash
   pnpm dev
   ```
   *Frontend จะรันอยู่ที่: `http://localhost:3000`*

---

## ✨ คุณสมบัติหลัก (Key Features)

- **User Authentication:** ระบบสมัครสมาชิกและเข้าสู่ระบบด้วย JWT
- **Room Management:** จัดการข้อมูลห้องประชุม (เพิ่ม/แก้ไข/ลบ)
- **Booking System:** ระบบจองห้องประชุม พร้อมปฏิทินแสดงผล (FullCalendar)
- **Dashboard:** สรุปข้อมูลการจองและสถานะต่างๆ
- **Responsive Design:** รองรับการแสดงผลทั้งบน Desktop และ Mobile

---

## 📝 รายละเอียด API (Backend Routers)

- `/users`: จัดการข้อมูลผู้ใช้
- `/login`: ระบบยืนยันตัวตน
- `/rooms`: จัดการข้อมูลห้องประชุม
- `/bookings`: จัดการข้อมูลการจองห้องประชุม
- `/health`: ตรวจสอบสถานะ Server

---