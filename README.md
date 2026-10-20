<<<<<<< HEAD
# 🍔 KHAANA. — Food Delivery & Restaurant Management System

**KHAANA.** is a full-stack, role-based food discovery, ordering, and restaurant management platform. Built with a **React + Zustand** frontend and a modular **PHP (OOP/PDO) + MySQL** REST API backend, it delivers an intuitive experience for customers, restaurant owners, and platform administrators.

---

## 🎥 Platform Demo Video

Watch the complete walk-through of **KHAANA.** showing customer ordering, checkout with local payment gateways (eSewa / Khalti), and real-time administrative controls:

<div align="center">
  <video src="./frontend/src/assets/video/Browsing_KHAANA_food_delivery_app_20261017205915.mp4" width="100%" controls poster="assets/thumbnail.png">
    Your browser does not support the video tag.
  </video>
</div>

> *Note: You can also replace `assets/khaana-demo.mp4` with a hosted video URL or an animated `.gif` file (`assets/khaana-demo.gif`).*

---

## ✨ Features Overview

### 🛒 Customer Portal
- **Culinary Exploration:** Browse trending dishes, popular cuisines (e.g., Margherita Pizza), and top-rated local restaurants.
- **Interactive Cart & Checkout:** Add items to cart with real-time price calculations and instant delivery fee updates.
- **Multiple Payment Gateways:** Supports **Cash on Delivery**, **eSewa**, and **Khalti** digital wallet payments.
- **Order Tracking:** Track active order statuses from placed to delivered.

### 🏢 Restaurant Owner Portal
- **Menu & Store Control:** Manage restaurant operational status (*Open/Closed*) and update menu items dynamically.
- **Order Management:** View incoming customer orders, update delivery statuses, and track fulfillment history.

### 🛡️ Admin Control Center (`Khanna Admin`)
- **Real-Time Analytics:** Monitor key business KPIs including **Total Revenue**, **Total Orders**, **Active Customers**, and **Partner Restaurants**.
- **User Management:** View all registered accounts across roles (`ADMIN`, `RESTURANT_OWNER`, `CUSTOMER`) with full administrative controls.
- **Platform Order Tracking:** Cross-platform oversight with live order filtering (`PENDING`, `DELIVERED`, `CANCELLED`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js (Vite)
- **State Management:** Zustand (`useAuthStore`)
- **HTTP Client:** Axios (configured with CORS & `withCredentials: true`)
- **UI & Styling:** Tailwind CSS / Custom Dark Theme
- **Notifications:** React Hot Toast

### Backend
- **Core Engine:** PHP 8.x (Object-Oriented Programming)
- **Database:** MySQL using PDO (Singleton `Database` pattern)
- **Security:** Bcrypt password hashing (`password_hash` / `password_verify`), SQL Injection defense via prepared statements
- **Authentication:** Token / Cookie-based session handling

---

## 📂 Project Structure

khaana-food-delivery/
├── assets/
│   ├── khaana-demo.mp4          # Platform Walkthrough Video
│   └── thumbnail.png            # Video Poster Thumbnail
├── backend/
│   ├── config/
│   │   └── db.php              # OOP Singleton PDO Database Connection
│   ├── controllers/
│   │   └── AuthController.php  # Authentication & User Management Logic
│   ├── api/
│   │   └── auth/               # REST Endpoints (/login, /register, /me, /logout)
│   └── index.php
│
└── frontend/
    ├── src/
    │   ├── Api/
    │   │   └── axios.js        # Axios instance with credentials & interceptors
    │   ├── store/
    │   │   └── useAuthStore.js # Zustand Auth state & role routing
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Restaurant.jsx
    │   │   ├── Checkout.jsx
    │   │   └── AdminDashboard.jsx
    │   └── App.jsx
    └── package.json
=======
# KHAANA Food Delivery

KHAANA is a full-stack food delivery and restaurant management application. Customers can discover restaurants and dishes, manage a cart, check out, and track orders. Restaurant owners manage their restaurant and menu, while administrators manage users, restaurants, orders, and partner applications.

## Demo video

The customer app walkthrough is stored in the repository:

<video src="frontend/src/assets/video/Browsing_KHAANA_food_delivery_app_20261017205915.mp4" controls width="100%">
  Your browser does not support embedded video. [Open the MP4](frontend/src/assets/video/Browsing_KHAANA_food_delivery_app_20261017205915.mp4).
</video>

Additional walkthroughs are in `frontend/src/assets/video/`:

- `Navigating_checkout_page_interface_20261017205911.mp4` — checkout flow
- `Admin_control_center_dashboard_a._20261017205905.mp4` — admin dashboard

## Features

- **Customer experience:** browse restaurants, cuisines, offers, and dishes; add items to the cart; manage addresses; check out; view orders and payment results.
- **Authentication:** cookie and bearer-token compatible sessions with role-based routing for customers, restaurant owners, and administrators.
- **Restaurant owner dashboard:** manage restaurant information, menu items, and incoming orders.
- **Administration:** review users, restaurants, orders, and partner applications.
- **Partner onboarding:** submit a restaurant application. An administrator can review or decline it; approving it creates a restaurant-owner account and restaurant profile. The applicant then signs in with the email and password chosen on the application form.
- **Payments:** supports Cash on Delivery and configured eSewa and Khalti payment flows. Online payments require provider credentials.
- **Careers:** browse open roles and submit a PDF application.

## Technology

### Frontend

- React 19, Vite, React Router
- Zustand for authentication state
- Axios for API requests
- Tailwind CSS 4 and Lucide icons
- React Hot Toast notifications

### Backend

- Node.js, Express 5
- Prisma ORM with PostgreSQL and Neon adapter
- JWT authentication, bcrypt password hashing, Zod validation
- Cloudinary for profile images

## Project layout

```text
backend/
  controllers/       Express request handlers
  middleware/        Authentication and role authorization
  prisma/            PostgreSQL Prisma schema
  routes/            API route definitions
  index.js           Express server entry point
frontend/
  src/Api/           Axios API client
  src/assets/video/  Product walkthrough videos
  src/components/    Shared UI and layouts
  src/pages/         Customer, admin, restaurant, and information pages
  src/store/         Zustand stores
```

## Setup

Use Node.js 20.19+ or 22.12+ and a PostgreSQL database.

### 1. Configure the backend

Create `backend/.env` with the following values:

```env
PORT=8000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL=your_runtime_database_url
DIRECT_URL=your_direct_database_url
JWT_SECRET=replace_with_a_long_random_secret
CLOUDINARY_CLOUD_NAME=optional_cloud_name
CLOUDINARY_API_KEY=optional_api_key
CLOUDINARY_API_SECRET=optional_api_secret
BACKEND_URL=http://localhost:8000
```

For payment provider integration, configure the keys read by `backend/controllers/payment.controller.js` (for example `ESEWA_SECRET_KEY`, `ESEWA_PRODUCT_CODE`, and `KHALTI_SECRET_KEY`). Do not commit real secrets.

Install backend dependencies, generate Prisma Client, sync the schema, and start the API:

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

`prisma db push` creates or updates database tables from `backend/prisma/schema.prisma`. Back up important data before applying schema changes to a production database.

### 2. Configure the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Optionally create `frontend/.env` to override the API URL:

```env
VITE_BASE_URL=http://localhost:8000/api
```

Start the Vite development server:

```bash
npm run dev
```

## Partner application flow

1. A restaurant submits its contact details and chooses a password at `/partner/signup`.
2. The backend validates the submission, rate-limits new applications, and stores the password as a bcrypt hash with a `PENDING` application.
3. An administrator reviews it in **Partner applications** in the admin dashboard.
4. Setting the status to **APPROVED** creates the `RESTURANT_OWNER` account and restaurant profile in one database transaction. The application hash is then cleared.
5. The administrator contacts the applicant outside the app after approval. The restaurant owner then signs in with the email and password from the application to reach the restaurant dashboard.

Applications are limited to five per IP address per 15 minutes. An email that already belongs to an account cannot be approved as a new owner; that case needs manual review.

## Useful commands

```bash
# Frontend production bundle
cd frontend && npm run build

# Frontend lint
cd frontend && npm run lint

# Regenerate Prisma Client after schema edits
cd backend && npx prisma generate
```
>>>>>>> 54f9387 (make pather with us, about, careear, FAQs pages)
