# 🏥 Prescripto — Full Stack Doctor Appointment System

A complete, production-ready doctor appointment booking platform with:
- **Patient Frontend** — Book appointments, manage profile, pay online
- **Admin Panel** — Manage doctors, view all appointments, dashboard analytics
- **Doctor Portal** — View appointments, manage availability, update profile
- **Backend API** — Node.js + Express + MongoDB REST API

---

## 🗂️ Project Structure

```
prescripto/
├── backend/          # Node.js + Express API
├── frontend/         # Patient React app (port 5173)
└── admin/            # Admin + Doctor React app (port 5174)
```

---

## ⚙️ Setup Instructions

### 1. Backend

```bash
cd backend
npm install
```

Edit `.env` with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_api_secret
ADMIN_EMAIL=admin@prescripto.com
ADMIN_PASSWORD=qwerty123
JWT_SECRET=your_secret_key
PORT=4000
CURRENCY=INR
RAZORPAY_KEY_ID=your_razorpay_key_id       # Optional, for payments
RAZORPAY_KEY_SECRET=your_razorpay_secret   # Optional, for payments
```

```bash
npm run dev   # Starts on port 4000
```

### 2. Frontend (Patient App)

```bash
cd frontend
npm install
```

Edit `.env`:
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

```bash
npm run dev   # Starts on port 5173
```

### 3. Admin Panel

```bash
cd admin
npm install
```

Edit `.env`:
```env
VITE_BACKEND_URL=http://localhost:4000
```

```bash
npm run dev   # Starts on port 5174
```

---

## 🔑 Default Admin Credentials

- **Email:** admin@prescripto.com
- **Password:** qwerty123

---

## ✨ Features

### Patient Frontend
- ✅ Register / Login with JWT auth
- ✅ Browse doctors by speciality
- ✅ Real-time slot availability picker (7-day calendar)
- ✅ Book appointments
- ✅ Online payment via Razorpay
- ✅ Cancel appointments
- ✅ Edit profile with photo upload
- ✅ Responsive design

### Admin Panel
- ✅ Admin login (credentials from .env)
- ✅ Dashboard with stats (doctors, patients, appointments)
- ✅ Add new doctors with photo upload (Cloudinary)
- ✅ View/manage all doctors — toggle availability
- ✅ View/cancel all appointments
- ✅ Doctor login portal
- ✅ Doctor dashboard with earnings stats
- ✅ Doctor can mark appointments as completed/cancelled
- ✅ Doctor can edit profile, fees, address

### Backend API
- ✅ `/api/admin/*` — Admin routes (protected)
- ✅ `/api/doctor/*` — Doctor routes (protected)
- ✅ `/api/user/*` — User routes (protected)
- ✅ Razorpay payment integration
- ✅ Cloudinary image uploads
- ✅ JWT authentication
- ✅ bcrypt password hashing

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Router v6 |
| Admin | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |
| Storage | Cloudinary |
| Payments | Razorpay |
| HTTP | Axios |

---

## 📱 API Endpoints

### Admin
| Method | Endpoint | Auth |
|---|---|---|
| POST | /api/admin/login | None |
| POST | /api/admin/add-doctor | Admin |
| GET | /api/admin/all-doctors | Admin |
| POST | /api/admin/change-availability | Admin |
| GET | /api/admin/appointments | Admin |
| POST | /api/admin/cancel-appointment | Admin |
| GET | /api/admin/dashboard | Admin |

### Doctor
| Method | Endpoint | Auth |
|---|---|---|
| GET | /api/doctor/list | None |
| POST | /api/doctor/login | None |
| GET | /api/doctor/appointments | Doctor |
| POST | /api/doctor/complete-appointment | Doctor |
| POST | /api/doctor/cancel-appointment | Doctor |
| GET | /api/doctor/dashboard | Doctor |
| GET | /api/doctor/profile | Doctor |
| POST | /api/doctor/update-profile | Doctor |

### User
| Method | Endpoint | Auth |
|---|---|---|
| POST | /api/user/register | None |
| POST | /api/user/login | None |
| GET | /api/user/get-profile | User |
| POST | /api/user/update-profile | User |
| POST | /api/user/book-appointment | User |
| GET | /api/user/appointments | User |
| POST | /api/user/cancel-appointment | User |
| POST | /api/user/payment-razorpay | User |
| POST | /api/user/verify-razorpay | User |
