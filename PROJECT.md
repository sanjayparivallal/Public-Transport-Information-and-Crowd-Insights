# 🚌 Public Transport Information & Crowd Insights App

A full-stack MERN application for commuters to access transport information and share real-time crowd/incident insights, with separate dashboards for commuters and transport authorities.

---

## 📁 Project Structure

```
public-transport/
├── frontend/          # React + Vite (UI)
└── backend/           # Node.js + Express + MongoDB (API)
```

---

## 👥 User Roles

| Role | Description |
|---|---|
| **Commuter** | Regular user — can search routes, report crowds/incidents, view dashboard |
| **Authority** | Transport authority — manages buses/trains, drivers, conductors, views all incidents |
| **Driver / Conductor (TTR)** | Assigned by Authority — can update crowd levels and bus position |

> **Note:** Driver and Conductor accounts are created from existing Commuter accounts (by email), assigned by an Authority user.

---

## 🔐 Authentication

- JWT-based authentication (no email activation links for now)
- **Separate Sign Up pages** for Commuter and Authority
- **Single Login page** for all roles — returns a JWT token on success
- Token stored in `localStorage` / `sessionStorage` on the frontend
- Backend `authMiddleware.js` protects all private routes

### Auth Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/commuter` | Register as Commuter |
| POST | `/api/auth/register/authority` | Register as Authority |
| POST | `/api/auth/login` | Login (all roles) — returns JWT |

---

## 📄 Pages & Features

### 1. Sign Up Pages

- `/signup/commuter` — Commuter registration form
- `/signup/authority` — Authority registration form
- Fields: Name, Email, Password, Confirm Password
- Authority may include: Organization / Region / Authority ID
- On success → redirect to Login

---

### 2. Login Page (`/login`)

- Single login page for all roles (Commuter, Authority, Driver/Conductor)
- On success → JWT stored, user redirected to their respective dashboard based on role

---

### 3. Dashboards

#### 🧍 Commuter Dashboard (`/dashboard/commuter`)
- Displays the commuter's **saved/favourite buses**
- Shows real-time crowd level for each favourite bus
- Quick links to search routes, report incident, view profile

#### 🏛️ Authority Dashboard (`/dashboard/authority`)
- Shows **all buses/trains** under the authority's control
- Displays:
  - Active incidents per route/line
  - Crowd levels (crowded / average / empty) per bus
  - Filter by: Line number, Time of day, Location, Delay status, Crowd density
- Incident alerts for critical reports

---

### 4. Search Route Page (`/search`)

**Search Filters:**
- Bus/Train Number
- Source (Origin)
- Destination
- Timing / Departure time
- Type: `Bus` or `Train`

**Results list** showing:
- Transport name
- Source → Destination
- Departure / arrival timing
- Type (Bus/Train)
- Crowd level badge

#### 🚌 Transport Detail Page (`/transport/:id`)

Opened when a user selects a result. Displays a **card** with:

| Section | Details |
|---|---|
| **Basic Info** | Name, Number, Type, Route, Operator |
| **Stops Timeline** | Visual timeline showing current position of the bus |
| **Fare Calculator** | Enter source & destination → shows estimated fare |
| **Crowd Level** | Current crowd status (Crowded / Average / Empty) |
| **Incidents** | List of reported incidents on this route |
| **Incident Alert** | Button to subscribe to alerts for this route |
| **Favourite** | Option to save this bus to dashboard |

---

### 5. Profile Page (`/profile`)

- Displays logged-in user's info: Name, Email, Role
- Edit options: Name, Password
- For Driver/Conductor: shows assigned bus/train
- For Authority: shows organization info

---

### 6. Authority — Transport Management (`/authority/manage`)

> **Authority-only page**

#### Transport (Bus/Train) Management
- **Add** a new bus/train (Number, Type, Route, Stops, Timings, Fare table)
- **Edit** existing transport details
- **Delete** a transport

#### Staff Assignment (per Transport)
- Search a Commuter by **email**
- Assign them as **Driver** or **Conductor/TTR** for a specific bus
- Assigned staff can then:
  - Update **crowd level** for their assigned bus
  - Update **current position/stop** of the bus

---

### 7. Crowd Reporting (Commuter)

- Commuters can report for any bus:
  - **Seat Availability**: Crowded / Average / Empty
  - **Incident**: Delay / Breakdown / Accident + optional description
- Reports are aggregated to calculate crowd levels per route

---

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| HTTP Client | Axios |
| Styling | CSS / Bootstrap |

---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone <repo-url>
cd public-transport
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/public_transport
JWT_SECRET=your_strong_jwt_secret_here
```

Start the server:

```bash
npm run dev       # development (nodemon)
npm start         # production
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`  
Backend API runs on: `http://localhost:5000`

---

## 📡 API Structure (Backend Routes)

```
/api/auth
  POST /register/commuter
  POST /register/authority
  POST /login

/api/transport          (protected)
  GET  /search          ← search with query params
  GET  /:id             ← full transport details
  POST /                ← add (Authority only)
  PUT  /:id             ← edit (Authority only)
  DELETE /:id           ← delete (Authority only)
  POST /:id/assign      ← assign driver/conductor (Authority only)

/api/crowd              (protected)
  POST /report          ← commuter/driver submits crowd level
  GET  /:transportId    ← get aggregated crowd for a transport

/api/incidents          (protected)
  POST /report          ← commuter reports incident
  GET  /                ← all incidents (Authority dashboard)
  GET  /:transportId    ← incidents for a transport

/api/users              (protected)
  GET  /profile         ← get current user profile
  PUT  /profile         ← update profile
  POST /favourites/:id  ← add favourite transport
  DELETE /favourites/:id ← remove favourite
```

---

## 🗂️ Frontend File Structure

```
frontend/src/
├── api/                    # Axios API call functions
├── assets/
├── components/             # Reusable UI components
│   ├── Navbar.jsx
│   ├── TransportCard.jsx
│   ├── CrowdBadge.jsx
│   ├── IncidentList.jsx
│   └── StopsTimeline.jsx
├── pages/
│   ├── auth/
│   │   ├── SignupCommuter.jsx
│   │   ├── SignupAuthority.jsx
│   │   └── Login.jsx
│   ├── dashboard/
│   │   ├── CommuterDashboard.jsx
│   │   └── AuthorityDashboard.jsx
│   ├── search/
│   │   └── SearchRoutes.jsx
│   ├── transport/               # Transport Detail page
│   │   └── TransportDetail.jsx
│   ├── profile/
│   │   └── Profile.jsx
│   └── authority/
│       └── ManageTransport.jsx
├── context/
│   └── AuthContext.jsx     # JWT token + user role state
├── hooks/
│   └── useAuth.js
├── App.jsx
└── main.jsx
```

> **How to use the API folder:**  
> Frontend developers never write raw `axios` calls. Just import and call the function:
> ```js
> import { searchTransports } from '../api/transportApi';
> const results = await searchTransports({ busNo: '12A', type: 'bus' });
> ```

---

## 🔒 Role-Based Route Protection

| Route | Accessible By |
|---|---|
| `/signup/commuter` | Public |
| `/signup/authority` | Public |
| `/login` | Public |
| `/dashboard/commuter` | Commuter, Driver, Conductor |
| `/dashboard/authority` | Authority |
| `/search` | All logged in users |
| `/transport/:id` | All logged in users |
| `/profile` | All logged in users |
| `/authority/manage` | Authority only |

---

## 📝 Team Task Split

| Member | Role | Responsibility |
|---|---|---|
| **Dev 1** | Backend | All backend — Express server, all routes (`auth`, `transport`, `crowd`, `incidents`, `users`), MongoDB models, JWT middleware, role middleware |
| **Dev 2** | Frontend | Auth pages (`/signup/commuter`, `/signup/authority`, `/login`), `AuthContext`, routing setup, Profile page (`/profile`), Commuter Dashboard (`/dashboard/commuter`) |
| **Dev 3** | Frontend | Search Route page (`/search`), Transport Detail page (`/transport/:id`), Authority Dashboard (`/dashboard/authority`), Authority Manage Transport page (`/authority/manage`) |

> **Frontend note:** All API calls are pre-built in `src/api/`. Do not write raw axios calls — import from the relevant api file and use directly.

---

## ✅ Important Notes for the Team

**Backend (Dev 1):**
- Use `protect` middleware from `middleware/authMiddleware.js` on all private routes
- Add a `roleMiddleware.js` for role-based access (e.g., `requireRole('authority')`)
- Drivers and Conductors are existing Commuter accounts — their role is updated when assigned by an Authority via email
- Keep `.env` out of version control (already in `.gitignore`)

**Frontend (Dev 2 & Dev 3):**
- All API functions are in `src/api/` — import and call directly, **do not write raw axios**
- The `axiosInstance.js` automatically attaches the JWT token from `localStorage` to every request
- Each page has its own folder under `src/pages/` to keep things organized and independent
- Use `AuthContext` for getting the current user's role and token across all pages
