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
