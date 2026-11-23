# StayEasy — Hotel Room Booking (MERN)

A full-stack hotel booking application built for project topic 18 in the supplied MERN capstone list.

## Implemented features
- Guest, hotel-manager and admin roles; registration/login; bcrypt password hashing; short-lived JWT access tokens and rotating refresh tokens.
- Protected React routes and role-based backend middleware.
- Hotel and room-type CRUD (managers manage their own hotels; admins can manage all).
- Search hotels by city and dates; availability uses the interval-overlap rule (`existing.checkIn < requested.checkOut && existing.checkOut > requested.checkIn`).
- Booking creation with server-side price calculation and room-capacity/availability checks; booking history; guest cancellation.
- Manager dashboard with occupancy and revenue aggregation reports.
- Provider-owned tour-plan creation and management; customers can filter plans by destination and book by travel date and traveler count.
- Admin dashboard for customer/provider account status and roles, hotels, room listings, hotel and tour bookings, tour packages, and combined platform statistics.
- Mongoose validation, collection relationships, indexes, central error middleware.
- Postman collection and sample environment included.

## Stack
Backend: Node.js, Express, MongoDB, Mongoose, bcryptjs, jsonwebtoken, dotenv, cors.
Frontend: React, Vite, React Router, Fetch API, Context API.

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## Run locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Set MONGO_URI and JWT_ACCESS_SECRET / JWT_REFRESH_SECRET in .env
npm run seed
npm run dev
```
API runs at `http://localhost:5000`; health endpoint: `/api/health`.

Seed creates:
- Admin: `admin@stayeasy.test` / `Admin123!`
- Manager: `manager@stayeasy.test` / `Manager123!`
- Guest: `guest@stayeasy.test` / `Guest123!`

Change these credentials for any non-demo use.

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open the Vite URL (normally `http://localhost:5173`).

Providers can create and manage their own plans under **Tour plans**. Customers can filter packages by destination from **Tours**, review itinerary and included facilities, select a travel date and traveler count, and see their tour bookings under **My tour bookings**. Package bookings are confirmed immediately; payment and departure-capacity scheduling are not integrated.

Admins can manage packages and other platform records from **Admin**. User, hotel, room, and package records are deactivated instead of permanently deleted; booking records are retained and their status can be updated.

## Environment variables
Backend `.env`:
- `PORT` — API port (default 5000)
- `MONGO_URI` — MongoDB connection string
- `JWT_ACCESS_SECRET` — access-token signing secret
- `JWT_REFRESH_SECRET` — refresh-token signing secret
- `CLIENT_URL` — frontend origin

Frontend `.env`:
- `VITE_API_URL` — API base URL (default `http://localhost:5000/api`)

Never commit `.env`. The repository ignores it.

## Main API routes
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/hotels?city=&checkIn=&checkOut=&guests=`, `GET /api/hotels/:id`
- `POST /api/hotels`, `PATCH /api/hotels/:id`, `DELETE /api/hotels/:id` (manager/admin)
- `POST /api/hotels/:hotelId/rooms`, `PATCH /api/rooms/:id`, `DELETE /api/rooms/:id` (manager/admin)
- `POST /api/bookings`, `GET /api/bookings/my`, `GET /api/bookings/:id`, `PATCH /api/bookings/:id/cancel`
- `GET /api/reports/manager`, `GET /api/reports/admin`
- `GET /api/tours?destination=...`, `GET /api/tours/:id` (public active packages); providers manage their plans with `GET /api/tours/mine` and `POST`, `PATCH`, `DELETE /api/tours` endpoints. Admins can manage and assign any package.
- `POST /api/tour-bookings`, `GET /api/tour-bookings/my` (customer-only); admins can update tour booking status with `PATCH /api/tour-bookings/admin/:id`.
- `GET /api/admin/dashboard`, `PATCH /api/admin/users/:id` (admin-only).

See `postman/StayEasy.postman_collection.json` for requests.

## Booking date rule
A booking occupies a room type when its status is `confirmed` and its date range overlaps the requested range. A range is treated as `[check-in, check-out)`, so a guest checking out on the day another guest checks in does not cause a clash. The server rechecks availability before saving; for production-grade high concurrency, add transactional inventory/locking and payment-provider integration.

## Notes
- Payment is intentionally not integrated; bookings are confirmed without collecting real money.
- Hotel images are image URLs, so use publicly accessible image URLs.
- This is a runnable educational capstone implementation. Configure HTTPS, secure cookies, rate limiting, audit logging and transactional inventory before production deployment.


## Account roles and availability
- **Customer**: searches by city/state/locality, checks date-specific room inventory, and books available rooms.
- **Provider**: creates hotel listings and destination-based tour plans, manages room types, prices, capacity and inventory, and views provider reports.
- **Admin**: system oversight.
- Registration allows Customer or Provider; Admin is not self-registerable.
- A room type is shown as bookable only when dates are selected and inventory remains. Booking API rechecks overlapping confirmed bookings and rejects over-capacity inventory.
