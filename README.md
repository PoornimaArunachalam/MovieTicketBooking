# 🎬 CinePulse - Movie Ticket Booking System

A full-stack, responsive Movie Ticket Booking application built with **React (Vite)**, **Node.js / Express**, and **MySQL**.

---

## ✨ Key Features

- 🔐 **User Authentication**: JWT-based login/registration with Role-Based Access Control (User / Admin).
- 🎬 **Movie Discovery**: Search, genre/language/status filters, detailed views, and user reviews with rating calculations.
- 🎟️ **Showtimes & Theatre Selection**: 7-day interactive date navigation and theatre listings.
- 💺 **Interactive Seat Selection**: Real-time seat layout grid (Regular & VIP seating options) with live price calculation.
- 💳 **Checkout & Coupon System**: Apply promo codes (e.g., `FIRST50`, `CINE100`) and simulated multi-method payment.
- 🎫 **Digital E-Tickets & QR Codes**: Dynamically generated tickets with scannable QR codes for quick validation.
- 🔔 **Notifications**: Real-time user booking status and offer alerts.
- 🛠️ **Admin Dashboard**: Full CRUD management for Movies, Theatres, Screens, Shows, Users, and Revenue Analytics.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 (Vite), React Router v6, Lucide Icons, Canvas Confetti, QRCode.react
- **Backend**: Node.js, Express 5, JSON Web Tokens (JWT), BcryptJS, QRCode
- **Database**: MySQL (connected via MySQL Workbench & `mysql2` connection pool)

---

## 🚀 Quick Setup Guide

### 1. Database Setup in MySQL Workbench

1. Open **MySQL Workbench** and connect to your local MySQL instance.
2. Click **File -> Open SQL Script...** and select `schema.sql` located in the root of this project repository.
3. Click the ⚡ **Execute (Lightning icon)** to run the entire script.
   - This creates the database `movie_booking_db`.
   - Creates all tables (`users`, `movies`, `theatres`, `screens`, `shows`, `bookings`, `reviews`, `coupons`, `notifications`).
   - Inserts initial demo seed data (movies, theatres, shows, admin & user accounts).

---

### 2. Configure Environment Variables

Edit the `.env` file in the project root directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_ROOT_PASSWORD
DB_NAME=movie_booking_db
JWT_SECRET=cinepulse_super_secret_jwt_key_2026
PORT=5000
```
> *Replace `YOUR_MYSQL_ROOT_PASSWORD` with your actual MySQL password. If your root user has no password, leave `DB_PASSWORD=` empty.*

---

### 3. Start the Application

Run the dev command from the root folder:

```bash
npm run dev
```

This will concurrently start:
- 🟢 **Backend API**: `http://localhost:5000`
- 🔵 **React Frontend**: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

You can use the quick-fill buttons on the Login page or log in using:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@cinepulse.com` | `admin123` | Full Admin Dashboard (`/admin`), Movie/Theatre/Show Management, Analytics |
| **User** | `john@example.com` | `user123` | Booking tickets, rating movies, viewing tickets & cancellation |

---

## 📂 Project Structure

```
MovieTicketBooking/
├── backend/
│   ├── config/db.js          # MySQL connection pool
│   ├── middleware/auth.js    # JWT & Admin authorization
│   ├── routes/               # API routes (auth, movies, theatres, bookings, admin)
│   └── app.js                # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── api/axios.js      # Axios client with token injection
│   │   ├── components/       # SeatMap, Navbar, MovieCard
│   │   ├── context/          # Auth & Toast context providers
│   │   ├── pages/            # Home, Movies, MovieDetail, Bookings, Auth, Admin
│   │   ├── index.css         # Glassmorphism design system & styles
│   │   ├── App.jsx           # Routing & guards
│   │   └── main.jsx          # Entry point
│   └── package.json
├── schema.sql                # Complete MySQL DB schema & seed data
├── .env                      # Environment config
├── package.json              # Root dependencies & concurrent dev scripts
└── README.md
```
