# System Architecture & Technical Design

This document details the architectural design, layered structure, data flows, and security models of the **Disaster Relief Management System (DRMS)** (branded as *CrisisRelief / Disaster Response Grid*).

---

## 1. High-Level Architecture Overview

DRMS follows a decoupled, client-server architecture built on modern web standards with strict separation of concerns, end-to-end type safety, and role-based access control.

```mermaid
graph TD
    subgraph Client Layer ["Client Tier (Frontend - React + Vite + TypeScript)"]
        UI[Tailwind CSS UI / Lucide Icons]
        Router[React Router v7 / Adaptive Layouts]
        AuthContext[Auth Context / Token Storage]
        ServiceLayer[Axios API Service Layer]
    end

    subgraph API Gateway ["Transport Layer"]
        HTTPS[HTTP / REST API - JSON]
        AuthHeader[Bearer JWT Token]
    end

    subgraph Server Layer ["Application Tier (Backend - Express + TypeScript)"]
        App[Express Application Entrypoint]
        Cors[CORS & Body Parser Middleware]
        AuthMw[JWT Authentication Middleware]
        RoleMw[Role Authorization Middleware]
        Controllers[Controller Layer - Request Validation]
        Services[Service Layer - Business Logic & State Machines]
        Repos[Repository Layer - Data Access]
        AuditSvc[Audit Logging Engine]
    end

    subgraph Persistence Layer ["Data Tier (PostgreSQL + Prisma ORM)"]
        Prisma[Prisma Client v7 + PG Adapter]
        DB[(PostgreSQL Relational Database)]
    end

    UI --> Router
    Router --> ServiceLayer
    AuthContext --> ServiceLayer
    ServiceLayer --> HTTPS
    HTTPS --> App
    App --> Cors
    Cors --> AuthMw
    AuthMw --> RoleMw
    RoleMw --> Controllers
    Controllers --> Services
    Services --> AuditSvc
    Services --> Repos
    Repos --> Prisma
    AuditSvc --> Repos
    Prisma --> DB
```

---

## 2. Layered Architecture Breakdown

### 2.1. Frontend Architecture (`frontend/src`)

The frontend is a single-page application (SPA) built with React 19, TypeScript, Vite, and Tailwind CSS.

- **Component Hierarchy & Layouts**:
  - `PublicLayout`: Encapsulates public navigation, branding, and crisis alert ribbons for unauthenticated users and citizens.
  - `DashboardLayout`: Provides role-aware navigation sidebars, session status, user profile dropdowns, and active crisis notifications.
  - `AdaptiveLayout`: Dynamically switches between public and dashboard navigation based on active authentication state.
- **Route Guards**:
  - `ProtectedRoute`: Verifies the presence of a valid JWT session in client storage; redirects unauthenticated visitors to `/login`.
  - `RoleRoute`: Validates user role claims against permitted role whitelists (`CITIZEN`, `RELIEF_CAMP_MANAGER`, `CONTROL_CENTRE_OPERATOR`, `DMA_SUPERVISOR`, `RELIEF_TEAM`).
- **Service Abstraction Layer (`frontend/src/services`)**:
  - Standardized Axios instance (`api.ts`) configured with automatic request interceptors that inject `Authorization: Bearer <token>` and response interceptors that clear stale sessions on `401 Unauthorized`.
  - Dedicated service modules for each functional domain (`camp.service.ts`, `resourceRequest.service.ts`, `team.service.ts`, `task.service.ts`, `delivery.service.ts`, `inventory.service.ts`, etc.).

---

### 2.2. Backend Architecture (`backend/`)

The backend is structured using an enterprise **Controller-Service-Repository** pattern in TypeScript:

```
backend/
├── config/             # Prisma client instance and database connection configuration
├── controllers/        # HTTP handlers: request parsing, parameter extraction, response formatting
├── middlewares/        # Security, JWT verification, and role-based authorization guards
├── repositories/       # Prisma query abstraction and database persistence operations
├── routes/             # Express route declarations with endpoint-level middleware binding
├── services/           # Domain business logic, state transitions, validation, and audit tracking
├── prisma/             # Relational data modeling, migrations, and PostgreSQL schema definition
├── app.ts              # Express application assembly and route mounting
└── server.ts           # HTTP server initialization and environment bootstrapper
```

- **Controller Layer (`controllers/`)**:
  - Validates HTTP input parameters, checks payload presence, extracts authenticated user context (`req.user`), and delegates execution to service handlers.
- **Service Layer (`services/`)**:
  - Houses core business rules, entity validations, workflow state machines, duplicate detection algorithms, and automatic audit log generation.
- **Repository Layer (`repositories/`)**:
  - Interacts directly with Prisma Client to execute relational queries, transactions, aggregations, and eager-loading of foreign relations.
- **Middleware Layer (`middlewares/`)**:
  - `authMiddleware.ts`: Decodes and verifies incoming Bearer JWT tokens, ensuring valid session state before route execution.
  - `roleMiddleware.ts`: Verifies that the authenticated user's role matches the required role permissions for the specific endpoint.

---

## 3. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant FE as Frontend (React App)
    participant API as Auth Controller (/api/auth)
    participant AuthSvc as Auth Service
    participant DB as PostgreSQL (Prisma)

    Note over User,DB: User Login Flow
    User->>FE: Enter Email & Password
    FE->>API: POST /api/auth/login { email, password }
    API->>AuthSvc: loginUser(email, password)
    AuthSvc->>DB: findUnique({ where: { email } })
    DB-->>AuthSvc: User Record (password_hash, role, etc.)
    AuthSvc->>AuthSvc: bcrypt.compare(password, password_hash)
    AuthSvc->>AuthSvc: jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '24h' })
    AuthSvc-->>API: { token, user }
    API-->>FE: 200 OK { token, user }
    FE->>FE: Store token in localStorage & update AuthContext
    FE->>User: Redirect to Role Dashboard

    Note over User,DB: Protected Route Access
    User->>FE: Navigate to Protected Resource
    FE->>API: GET /api/resource-requests (Header: Bearer <token>)
    API->>API: authMiddleware: Verify JWT & extract req.user
    API->>API: roleMiddleware: Authorize ['CONTROL_CENTRE_OPERATOR']
    API->>DB: Fetch authorized data
    DB-->>API: Data records
    API-->>FE: 200 OK JSON response
```

---

## 4. Core Subsystems & Workflows

### 4.1. Dual-Channel Resource Request Ingestion

DRMS supports two distinct channels for raising resource requests:

1. **Online Channel (Camp Manager)**:
   - Raised directly via `POST /api/resource-requests`.
   - Requires `RELIEF_CAMP_MANAGER` role.
   - Automatically bound to the manager's assigned camp ID (`managedCampId`).
   - Channel is strictly recorded as `ONLINE`.
2. **On-Behalf Phone/SMS Channel (Control Centre Operator)**:
   - Raised via `POST /api/resource-requests/on-behalf`.
   - Designed for offline relief camps communicating via emergency telephone or SMS radio.
   - Requires `CONTROL_CENTRE_OPERATOR` role.
   - Operator selects target camp and specifies channel (`PHONE` or `SMS`).
   - Automatically tracks the operator as the digitizer (`createdById`) and initiates the standard verification and duplicate detection workflow.

```mermaid
stateDiagram-v2
    [*] --> PENDING : Created (Online / Phone / SMS)
    PENDING --> VERIFIED : Control Centre Verifies Request
    PENDING --> REJECTED : Control Centre Rejects Request
    VERIFIED --> ASSIGNED : Relief Team Assigned
    ASSIGNED --> IN_PROGRESS : Task / Delivery Dispatched
    IN_PROGRESS --> PARTIALLY_FULFILLED : Partial Items Received
    IN_PROGRESS --> FULFILLED : All Items Delivered & Confirmed
    PARTIALLY_FULFILLED --> FULFILLED : Remaining Items Delivered
    PENDING --> CANCELLED : Request Cancelled
    VERIFIED --> CANCELLED : Request Cancelled
```

---

### 4.2. Duplicate Request Detection & Review

To prevent inventory depletion and duplicate dispatches during chaotic emergency scenarios:
- The system checks newly submitted requests against recent active requests from the same camp.
- Potential duplicates are flagged in `RequestDuplicateCheck` with status `PENDING`.
- Control Centre Operators review candidate duplicates via `PUT /api/duplicate-checks/:id/review` and assign decisions:
  - `CONFIRMED_DUPLICATE`: Marks candidate request as duplicate, preventing redundant dispatches.
  - `NOT_DUPLICATE`: Clears candidate request for standard verification and processing.
  - `DISMISSED`: Dismisses the check with an audit justification note.

---

### 4.3. Field Task & Delivery Lifecycle

```mermaid
stateDiagram-v2
    state TaskLifecycle {
        [*] --> ASSIGNED_TASK : Operator dispatches Task
        ASSIGNED_TASK --> ACCEPTED : Field Team accepts Task
        ACCEPTED --> IN_PROGRESS_TASK : Field Team en route / on site
        IN_PROGRESS_TASK --> COMPLETED : Mission successful
        IN_PROGRESS_TASK --> FAILED : Execution failed / unreachable
        ASSIGNED_TASK --> CANCELLED_TASK : Cancelled by Operator
    }

    state DeliveryLifecycle {
        [*] --> PLANNED : Delivery created for Request
        PLANNED --> IN_TRANSIT : Goods loaded & dispatched
        IN_TRANSIT --> DELIVERED : Received by Camp Manager
        IN_TRANSIT --> PARTIALLY_DELIVERED : Partial inventory handed over
        IN_TRANSIT --> FAILED_DELIVERY : Delivery vehicle issue / route blocked
    }
```

---

### 4.4. Camp Master Data vs. Operational Data Separation

To maintain strict data integrity between administrative governance and active emergency operations:

| Data Class | Managed By | API Endpoint | Modifiable Attributes |
| :--- | :--- | :--- | :--- |
| **Official Master Data** | `DMA_SUPERVISOR` | `PUT /api/dma/camps/:id` | `officialCode`, `name`, `address`, `latitude`, `longitude`, `capacity` |
| **Operational Live Data** | `RELIEF_CAMP_MANAGER` | `PUT /api/camp-manager/me` | `operationalStatus`, `currentOccupancy`, `operationalNotes` |

---

### 4.5. Comprehensive Audit Logging Engine

The audit logging subsystem (`backend/services/auditLogService.ts`) records all high-impact actions across the disaster response grid:

- **Logged Actions**: `CREATE`, `UPDATE`, `DELETE`, `VERIFY`, `REJECT`, `ASSIGN`, `OVERRIDE`, `STATUS_CHANGE`, `DUPLICATE_DECISION`.
- **Recorded Context**:
  - `action`: Specific operation performed.
  - `entityType`: Target entity (e.g., `ResourceRequest`, `ReliefCamp`, `Task`, `Delivery`).
  - `entityId`: Unique primary key of the modified entity.
  - `performedById`: User ID of the actor executing the action.
  - `beforeData`: JSON snapshot of entity state prior to mutation.
  - `afterData`: JSON snapshot of entity state following mutation.
  - `description`: Human-readable summary of the action.
  - `createdAt`: ISO 8601 server timestamp.

Audit logs are immutable and can be queried by `CONTROL_CENTRE_OPERATOR` and `DMA_SUPERVISOR` roles for legal compliance, post-disaster retrospective analysis, and operational traceability.
