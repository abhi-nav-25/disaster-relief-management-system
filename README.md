# Disaster Relief Management System (DRMS)

> **CrisisRelief / Disaster Response Grid**  
> An integrated, role-based platform for emergency relief coordination, real-time shelter occupancy tracking, multi-channel resource requisition, and field team dispatch.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38B2AC.svg)](https://tailwindcss.com/)

---

## 1. Project Overview

In the aftermath of natural disasters (floods, cyclones, earthquakes), emergency response efforts often suffer from fragmented communication, unverified requisitions, redundant aid dispatches, and zero visibility into on-ground camp inventory.

**Disaster Relief Management System (DRMS)** (branded as **CrisisRelief**) provides an end-to-end disaster coordination grid that connects citizens, relief camps, control centre operators, disaster management authority (DMA) supervisors, and field relief teams on a unified, real-time operational platform.

### The Problem
- **Communication Breakdown**: Remote camps frequently lose internet access and rely on fragmented phone calls or SMS messages that never enter official requisition queues.
- **Aid Duplication & Wastage**: Multiple uncoordinated agencies dispatch identical supplies to the same camp while neighboring shelters experience critical shortages.
- **Lack of Real-time Visibility**: Control centres lack live telemetry on field team readiness, shelter capacity, and stock levels.
- **No Operational Auditability**: Absence of tamper-evident change logs leaves decision-makers unable to trace requisition approvals, priorities, or delivery failures.

### The Solution
- **Multi-Channel Request Ingestion**: Camp managers submit requisitions online, while Control Centre Operators digitize offline **Phone/SMS** requests into the central queue.
- **Automated Duplicate Detection**: Algorithms scan incoming requisitions against active requests from the same camp to flag redundancies for operator review.
- **Live Inventory & Occupancy Tracking**: Relief camps manage stock transactions (Receipt, Consumption, Adjustment) and report occupancy metrics in real time.
- **Field Task & Delivery Coordination**: Dispatches and missions follow strict state machines from assignment through to verified handover.
- **Immutable Audit Logging**: Every critical action (status changes, priority overrides, duplicate reviews, verification) is recorded with full before/after snapshots.

---

## 2. Implemented User Roles

The platform provides dedicated workflows and access controls for five distinct roles:

```mermaid
graph TD
    User((Authenticated / Guest User))
    
    User -->|Public / Guest| PublicAccess[Public Emergency Portal]
    User -->|CITIZEN| CitizenPortal[Citizen Assistance Dashboard]
    User -->|RELIEF_CAMP_MANAGER| CampManagerPortal[Camp Operations & Inventory]
    User -->|CONTROL_CENTRE_OPERATOR| ControlCentrePortal[Incident Command & Dispatch]
    User -->|DMA_SUPERVISOR| DMAPortal[Master Data & Authority Oversight]
    User -->|RELIEF_TEAM| TeamPortal[Field Operations & Task Execution]
```

| Role | Primary Responsibilities | Dashboard Route |
| :--- | :--- | :--- |
| **Citizen** | Locates operational relief camps, uses GPS to find nearest shelters, accesses emergency contact directories, and views relief resources. | `/dashboard/citizen` |
| **Relief Camp Manager** | Manages camp occupancy and operational status, updates live stock inventory, raises online resource requisitions, and tracks incoming deliveries. | `/dashboard/camp-manager` |
| **Control Centre Operator** | Verifies resource requests, manages priorities, executes duplicate checks, digitizes Phone/SMS requests on behalf of camps, and dispatches field teams and deliveries. | `/dashboard/control-centre` |
| **DMA Supervisor** | Maintains official camp master data, oversees resource catalogs, creates and monitors relief teams, and reviews system-wide audit logs. | `/dashboard/dma-supervisor` |
| **Relief Team** | Manages operational readiness status (`AVAILABLE`, `BUSY`, `OFFLINE`), accepts field tasks, updates task progress, and records resource delivery handovers. | `/dashboard/relief-team` |

---

## 3. End-to-End System Workflows

### 3.1. Public & Citizen Workflows
- **Relief Camps Directory**: Browse operational shelters, capacity limits, and current availability (`/camps`).
- **Nearest Camp Locator**: Calculates geodesic distance to all active camps using the Haversine formula based on device GPS coordinates or custom coordinates (`/camps/nearest`).
- **Emergency Directory**: Instant access to verified emergency helplines, SDRF/NDRF contacts, police, and ambulance dispatch (`/emergency-contacts`).
- **Public Resource Catalog**: Transparent overview of standardized relief aid items and units (`/resources`).

### 3.2. Camp Manager Workflows
- **Camp Operational Status**: Live toggle between `OPERATIONAL`, `LIMITED`, `FULL`, `TEMPORARILY_CLOSED`, and `CLOSED`.
- **Occupancy Management**: Record headcounts and shelter notes.
- **Inventory Ledger**: Track stock balances across items and record transactions (`RECEIPT`, `DELIVERY`, `CONSUMPTION`, `ADJUSTMENT`).
- **Online Requisition**: Submit structured resource requests directly through the web portal (`POST /api/resource-requests`).

### 3.3. Control Centre Workflows
- **Requisition Verification**: Review submitted requests, assign priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and verify or reject.
- **Duplicate Request Review**: Run automated duplicate detection against active requests for the same camp and review potential duplicates (`CONFIRMED_DUPLICATE`, `NOT_DUPLICATE`, `DISMISSED`).
- **Raise Request on Behalf of Camp**: When a remote camp has no internet connectivity, the operator receives requirements via phone or SMS and digitizes the request into the system via `POST /api/resource-requests/on-behalf` (accepted channels: `PHONE`, `SMS`).
- **Field Dispatch**: Assign available relief teams (`POST /api/request-assignments/...`) and dispatch field tasks (`POST /api/tasks`) and deliveries (`POST /api/deliveries`).
- **Audit Trails**: Inspect chronological audit logs for all disaster response actions.

### 3.4. DMA Supervisor Workflows
- **Master Data Governance**: Update official camp codes, authorized capacity, coordinates, and physical addresses (`PUT /api/dma/camps/:id`).
- **Relief Team Management**: Create teams, assign member personnel, and oversee deployment statuses (`/api/teams`).
- **Standardized Catalog**: Create and update official relief item categories and measurement units (`/api/resources`).

### 3.5. Relief Team Workflows
- **Readiness Telemetry**: Update team status (`AVAILABLE`, `BUSY`, `OFFLINE`).
- **Task Lifecycle**: Accept assigned tasks and advance status through `ACCEPTED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED` / `FAILED`.
- **Delivery Fulfillment**: Track assigned supply consignments and update transit status (`PLANNED` &rarr; `IN_TRANSIT` &rarr; `DELIVERED`).

---

## 4. Technology Stack

### Frontend
- **Framework**: React 19 (TypeScript, Single-Page Application)
- **Build Tool**: Vite 8
- **Routing**: React Router v7 (with `ProtectedRoute`, `RoleRoute`, and `AdaptiveLayout`)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **HTTP Client**: Axios with Bearer JWT interceptors

### Backend
- **Runtime**: Node.js
- **Web Framework**: Express 5 (TypeScript)
- **Database ORM**: Prisma Client v7 with PostgreSQL adapter (`@prisma/adapter-pg`, `pg`)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) with `bcrypt` password hashing
- **Middleware**: CORS, JSON Body Parser, JWT Authentication Guard, Role Authorization Guard

### Database
- **Database Engine**: PostgreSQL 14+
- **Schema & Migrations**: Prisma Migration Engine (14 Relational Models, 11 Enums)

---

## 5. System Architecture

```mermaid
graph LR
    subgraph Frontend ["Frontend (React + Vite + TypeScript)"]
        PublicPages[Public & Citizen Views]
        Dashboards[Role-Based Dashboards]
        AuthGuard[Auth Context & Route Guards]
        AxiosClient[Axios API Client]
    end

    subgraph Backend ["Backend (Express + TypeScript)"]
        Router[Express Routes]
        AuthMiddleware[JWT & Role Middlewares]
        Controllers[Controller Layer]
        Services[Service Layer & State Machines]
        AuditLog[Audit Logging Subsystem]
        Repositories[Repository Layer]
    end

    subgraph Database ["Data Store (PostgreSQL)"]
        PrismaORM[Prisma Client v7]
        PostgresDB[(PostgreSQL DB)]
    end

    PublicPages --> AxiosClient
    Dashboards --> AxiosClient
    AuthGuard --> Dashboards
    AxiosClient -->|HTTP / REST JSON| Router
    Router --> AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers --> Services
    Services --> AuditLog
    Services --> Repositories
    Repositories --> PrismaORM
    AuditLog --> Repositories
    PrismaORM --> PostgresDB
```

*For in-depth architectural details, state machines, and data flow diagrams, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).*

---

## 6. Repository Structure

```
disaster-relief-management-system/
├── backend/
│   ├── config/             # Prisma client & database initialization
│   ├── controllers/        # Request handling and HTTP parameter parsing (14 controllers)
│   ├── middlewares/        # JWT authentication and role authorization guards
│   ├── repositories/       # Data access and Prisma query execution
│   ├── routes/             # Express API route bindings (14 route modules)
│   ├── services/           # Business logic, state transitions & audit logging
│   ├── prisma/             # Schema definitions and database migrations
│   │   ├── migrations/     # Versioned SQL migrations
│   │   └── schema.prisma   # PostgreSQL schema & relational models
│   ├── .env.example        # Backend environment variables template
│   ├── app.ts              # Express application assembly
│   ├── package.json        # Backend dependencies & npm scripts
│   ├── server.ts           # HTTP server bootstrapper
│   └── tsconfig.json       # TypeScript configuration
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # Reusable UI elements, modals, alerts, and route guards
│   │   ├── context/        # Global React contexts (AuthContext)
│   │   ├── hooks/          # Custom React hooks (useAuth)
│   │   ├── layouts/        # PublicLayout, DashboardLayout, AdaptiveLayout
│   │   ├── pages/          # Public pages, auth views, and role dashboards
│   │   │   ├── auth/       # LoginPage, RegisterPage
│   │   │   ├── dashboards/ # 5 Role-Specific Dashboards
│   │   │   └── public/     # HomePage, PublicCampsPage, NearestCampsPage, etc.
│   │   ├── routes/         # AppRoutes definition with role protection
│   │   ├── services/       # Domain-specific Axios API services (15 service files)
│   │   ├── types/          # TypeScript interface and enum definitions
│   │   └── utils/          # Haversine distance calculator, formatters
│   ├── .env.example        # Frontend environment template
│   ├── index.html          # HTML entrypoint
│   ├── package.json        # Frontend dependencies & npm scripts
│   └── vite.config.ts      # Vite configuration
├── docs/
│   ├── ARCHITECTURE.md     # In-depth architectural design & state machines
│   ├── API.md              # Authoritative REST API endpoint documentation
│   └── screenshots/        # Directory reserved for application interface captures
├── CONTRIBUTING.md         # Open-source contribution workflow and guidelines
├── .gitignore              # Git ignore rules for build artifacts & secrets
└── README.md               # Project documentation
```

---

## 7. REST API Overview

The backend exposes 14 modular REST API route groups. Below is a summary of the core endpoints:

| Domain | Route Prefix | Key Endpoints | Access Level |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `GET /profile` | Public / Authenticated |
| **Camps** | `/api/camps` | `GET /`, `GET /nearest`, `GET /:id` | Public |
| **Emergency** | `/api/emergency-contacts` | `GET /` | Public |
| **Resources** | `/api/resources` | `GET /`, `POST /`, `PUT /:id` | Public / `DMA_SUPERVISOR` |
| **Inventory** | `/api/inventory` | `GET /my-camp`, `PUT /my-camp/:resourceId` | `RELIEF_CAMP_MANAGER` |
| **Requests** | `/api/resource-requests` | `POST /`, `POST /on-behalf`, `GET /`, `PUT /:id/verify`, `PUT /:id/priority` | `RELIEF_CAMP_MANAGER` / `CONTROL_CENTRE_OPERATOR` |
| **Duplicates** | `/api/duplicate-checks` | `POST /request/:id/detect`, `PUT /:id/review` | `CONTROL_CENTRE_OPERATOR` |
| **Assignments** | `/api/request-assignments` | `GET /available-teams`, `POST /request/:reqId/team/:teamId` | `CONTROL_CENTRE_OPERATOR` |
| **Teams** | `/api/teams` | `GET /`, `POST /`, `PUT /:id/status` | `DMA_SUPERVISOR` / `CONTROL_CENTRE_OPERATOR` / `RELIEF_TEAM` |
| **Tasks** | `/api/tasks` | `POST /`, `GET /my-team`, `PUT /:id/status` | `CONTROL_CENTRE_OPERATOR` / `RELIEF_TEAM` |
| **Deliveries** | `/api/deliveries` | `POST /`, `GET /request/:id`, `PUT /:id/status` | `CONTROL_CENTRE_OPERATOR` / `RELIEF_TEAM` |
| **Audit Logs** | `/api/audit-logs` | `GET /`, `POST /` | `CONTROL_CENTRE_OPERATOR` / `DMA_SUPERVISOR` |
| **DMA Camps** | `/api/dma/camps` | `PUT /:id` | `DMA_SUPERVISOR` |
| **Camp Manager**| `/api/camp-manager` | `PUT /me` | `RELIEF_CAMP_MANAGER` |

*For complete parameter definitions, request bodies, and JSON responses, refer to [docs/API.md](docs/API.md).*

---

## 8. Local Setup & Installation

### 8.1 Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher running locally or on a cloud provider

### 8.2 Environment Configuration

1. **Backend Environment**:
   Create `backend/.env` from the template:
   ```bash
   cd backend
   cp .env.example .env
   ```
   Configure the following variables in `backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/drms_db?schema=public"
   JWT_SECRET="your_development_jwt_secret_key"
   ```

2. **Frontend Environment**:
   Create `frontend/.env` from the template:
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
   Configure `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### 8.3 Database Migration & Initialization

Apply Prisma schema migrations to your PostgreSQL database:

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
```

### 8.4 Running the Application

Open two terminal instances:

- **Terminal 1: Start Backend API**:
  ```bash
  cd backend
  npm run dev
  ```
  *Server starts at `http://localhost:5000`.*

- **Terminal 2: Start Frontend Web Application**:
  ```bash
  cd frontend
  npm run dev
  ```
  *Web client opens at `http://localhost:5173`.*

---

## 9. Demo & Test User Accounts

The application includes built-in quick-fill credentials on the Sign In page (`/login`) for evaluation of role-specific dashboards:

| Role Profile | Demo Email | Default Password | Initial Assigned Context |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@crisis.org` | `password123` | Public Assistance Access |
| **Control Centre Operator** | `control@crisis.org` | `password123` | Command & Dispatch Access |
| **DMA Supervisor** | `supervisor@dma.gov` | `password123` | Master Data & Oversight Access |
| **Camp Manager** | `manager@camp.org` | `password123` | Assigned Relief Camp Operations |
| **Relief Team** | `teamalpha@relief.org` | `password123` | Assigned Field Response Team |

*(New accounts can also be created at `/register` by selecting any target role).*

---

## 10. Screenshots

> *Application screenshots are cataloged in [`docs/screenshots/`](docs/screenshots/).*

| View | Description | Reference Placeholder |
| :--- | :--- | :--- |
| **Public Landing** | Crisis alert header, nearest shelter locator, and emergency helpline cards. | `docs/screenshots/01-public-landing.png` |
| **Nearest Camps** | Geodesic GPS distance calculations and live occupancy badges. | `docs/screenshots/02-nearest-camps.png` |
| **Citizen Portal** | Disaster relief guidance and direct emergency contact directory. | `docs/screenshots/03-citizen-portal.png` |
| **Camp Manager Dashboard** | Live occupancy controls, inventory adjustments, and online request creation. | `docs/screenshots/04-camp-manager-dashboard.png` |
| **Control Centre Dashboard** | Request verification, duplicate review, on-behalf phone/SMS ingestion, and team dispatch. | `docs/screenshots/05-control-centre-dashboard.png` |
| **DMA Supervisor Dashboard**| Master camp registry, resource catalog maintenance, and system audit logs. | `docs/screenshots/06-dma-supervisor-dashboard.png` |
| **Relief Team Dashboard** | Field readiness toggle, assigned task status progression, and delivery tracking. | `docs/screenshots/07-relief-team-dashboard.png` |

---

## 11. Project Status

The core functional capabilities of the Disaster Relief Management System—including multi-role authentication, public camp lookups with Haversine distance calculations, online and phone/SMS resource requisition, automated duplicate detection, field task assignment, delivery workflows, and PostgreSQL audit logging—have been fully implemented and validated in local testing.

---

## 12. Contributing & Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Deep dive into system design, state machines, and data models
- [docs/API.md](docs/API.md) - Authoritative REST API endpoint reference
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution workflow, development standards, and pull request guidelines
