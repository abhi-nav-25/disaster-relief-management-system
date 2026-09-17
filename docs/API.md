# Disaster Relief Management System (DRMS) - REST API Reference

This document provides complete, authoritative documentation for all implemented backend REST API endpoints in the Disaster Relief Management System.

---

## Global Conventions

- **Base URL**: `http://localhost:5000/api` (configurable via `PORT` in backend and `VITE_API_URL` in frontend)
- **Data Format**: `application/json` for all request bodies and responses
- **Authentication**: Bearer Token in standard HTTP Authorization header:
  ```http
  Authorization: Bearer <your_jwt_token>
  ```
- **Error Format**:
  ```json
  {
    "message": "Human-readable description of error"
  }
  ```

---

## 1. Authentication (`/api/auth`)

### 1.1 Register User
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Authorization**: Public
- **Description**: Registers a new user account with an assigned system role.
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "securePassword123",
    "phone": "+1234567890",
    "role": "CITIZEN"
  }
  ```
  *Permitted `role` values*: `CITIZEN`, `RELIEF_CAMP_MANAGER`, `CONTROL_CENTRE_OPERATOR`, `DMA_SUPERVISOR`, `RELIEF_TEAM`
- **Response**: `201 Created`
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "CITIZEN",
      "phone": "+1234567890"
    }
  }
  ```

### 1.2 User Login
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Authorization**: Public
- **Description**: Authenticates user credentials and issues a signed JSON Web Token (JWT).
- **Request Body**:
  ```json
  {
    "email": "operator@crisis.org",
    "password": "password123"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": 2,
      "name": "Control Operator",
      "email": "control@crisis.org",
      "role": "CONTROL_CENTRE_OPERATOR",
      "managedCampId": null
    }
  }
  ```

### 1.3 Get Current User Profile
- **Method**: `GET`
- **Endpoint**: `/api/auth/profile`
- **Authorization**: Bearer JWT (Any Authenticated Role)
- **Description**: Retrieves full profile details and team/camp relations for the authenticated user session.
- **Response**: `200 OK`

---

## 2. Relief Camps (`/api/camps`)

### 2.1 List All Relief Camps
- **Method**: `GET`
- **Endpoint**: `/api/camps`
- **Authorization**: Public
- **Description**: Returns all relief camps with current operational status, capacity, occupancy, and inventory.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "officialCode": "CAMP-001",
      "name": "Central High School Relief Shelter",
      "address": "123 Main St, Sector 4",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "capacity": 500,
      "currentOccupancy": 320,
      "operationalStatus": "OPERATIONAL",
      "operationalNotes": "Accepting families; medical desk active",
      "inventory": [
        {
          "resource": { "id": 1, "name": "Drinking Water (1L Bottles)", "unit": "bottles" },
          "quantity": 1200
        }
      ]
    }
  ]
  ```

### 2.2 Find Nearest Relief Camps
- **Method**: `GET`
- **Endpoint**: `/api/camps/nearest`
- **Authorization**: Public
- **Query Parameters**:
  - `lat` (number, required): User latitude
  - `lng` (number, required): User longitude
  - `maxDistanceKm` (number, optional, default: 50): Maximum search radius in kilometers
- **Description**: Computes geodesic distances using the Haversine formula and returns sorted nearest camps with live occupancy and status.
- **Response**: `200 OK`

### 2.3 Get Relief Camp by ID
- **Method**: `GET`
- **Endpoint**: `/api/camps/:id`
- **Authorization**: Public
- **Description**: Retrieves comprehensive details for a specific relief camp.
- **Response**: `200 OK`

---

## 3. Emergency Contacts (`/api/emergency-contacts`)

### 3.1 List Emergency Contacts
- **Method**: `GET`
- **Endpoint**: `/api/emergency-contacts`
- **Authorization**: Public
- **Description**: Returns verified emergency dispatch numbers, disaster helplines, and medical services ordered by priority.
- **Response**: `200 OK`
  ```json
  [
    {
      "id": 1,
      "name": "State Disaster Response Force (SDRF)",
      "serviceType": "Disaster Helpline",
      "phoneNumber": "1070",
      "description": "24/7 State Emergency Control Room",
      "isActive": true,
      "displayOrder": 1
    }
  ]
  ```

---

## 4. Resource Catalog (`/api/resources`)

### 4.1 List Resources
- **Method**: `GET`
- **Endpoint**: `/api/resources`
- **Authorization**: Public
- **Description**: Retrieves standardized catalog of relief items, food supplies, medical kits, and equipment.
- **Response**: `200 OK`

### 4.2 Get Resource by ID
- **Method**: `GET`
- **Endpoint**: `/api/resources/:id`
- **Authorization**: Public
- **Response**: `200 OK`

### 4.3 Create Resource Category
- **Method**: `POST`
- **Endpoint**: `/api/resources`
- **Authorization**: `DMA_SUPERVISOR`
- **Request Body**:
  ```json
  {
    "name": "Emergency Medical Kit Type-A",
    "unit": "kits",
    "description": "Standard trauma response medical supplies"
  }
  ```
- **Response**: `201 Created`

### 4.4 Update Resource
- **Method**: `PUT`
- **Endpoint**: `/api/resources/:id`
- **Authorization**: `DMA_SUPERVISOR`
- **Request Body**:
  ```json
  {
    "name": "Emergency Medical Kit Type-A (Updated)",
    "unit": "kits",
    "description": "Includes pediatric items",
    "isActive": true
  }
  ```
- **Response**: `200 OK`

---

## 5. Camp Inventory (`/api/inventory`)

### 5.1 Get Camp Inventory
- **Method**: `GET`
- **Endpoint**: `/api/inventory/my-camp`
- **Authorization**: `RELIEF_CAMP_MANAGER`
- **Description**: Retrieves real-time stock balances and inventory transactions for the manager's assigned camp.
- **Response**: `200 OK`

### 5.2 Adjust Inventory Balance
- **Method**: `PUT`
- **Endpoint**: `/api/inventory/my-camp/:resourceId`
- **Authorization**: `RELIEF_CAMP_MANAGER`
- **Request Body**:
  ```json
  {
    "type": "ADJUSTMENT",
    "quantity": 50,
    "notes": "Physical count adjustment after morning distribution"
  }
  ```
  *Permitted `type` values*: `RECEIPT`, `DELIVERY`, `CONSUMPTION`, `ADJUSTMENT`
- **Response**: `200 OK`

---

## 6. Resource Requests (`/api/resource-requests`)

### 6.1 Create Online Resource Request (Camp Manager)
- **Method**: `POST`
- **Endpoint**: `/api/resource-requests`
- **Authorization**: `RELIEF_CAMP_MANAGER`
- **Description**: Camp Manager raises an official online resource requisition for their assigned camp.
- **Request Body**:
  ```json
  {
    "channel": "ONLINE",
    "description": "Urgent infant formula and clean blankets needed for 80 children.",
    "items": [
      { "resourceId": 2, "quantity": 100, "notes": "Infant formula (0-6 months)" },
      { "resourceId": 5, "quantity": 80, "notes": "Thermal blankets" }
    ]
  }
  ```
- **Response**: `201 Created`

### 6.2 Raise Request on Behalf of Camp (Control Centre Operator)
- **Method**: `POST`
- **Endpoint**: `/api/resource-requests/on-behalf`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Description**: Digitizes offline requests received via **PHONE** or **SMS** when field camps have no internet connectivity.
- **Request Body**:
  ```json
  {
    "campId": 1,
    "channel": "PHONE",
    "description": "Phone call received from Camp Lead: Water pump failure, urgent bulk water required.",
    "priority": "HIGH",
    "items": [
      { "resourceId": 1, "quantity": 500, "notes": "Drinking Water 1L" }
    ]
  }
  ```
  *Permitted `channel` values*: `PHONE`, `SMS`
  *Permitted `priority` values*: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (default: `MEDIUM`)
- **Response**: `201 Created`

### 6.3 List Camp's Own Requests
- **Method**: `GET`
- **Endpoint**: `/api/resource-requests/my-camp`
- **Authorization**: `RELIEF_CAMP_MANAGER`
- **Response**: `200 OK`

### 6.4 List All Resource Requests
- **Method**: `GET`
- **Endpoint**: `/api/resource-requests`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Description**: Retrieves all requests with optional status, priority, and verification filters.
- **Response**: `200 OK`

### 6.5 Verify Resource Request
- **Method**: `PUT`
- **Endpoint**: `/api/resource-requests/:id/verify`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Request Body**:
  ```json
  {
    "verificationStatus": "VERIFIED",
    "notes": "Verified requirements with on-site district liaison."
  }
  ```
  *Permitted `verificationStatus` values*: `VERIFIED`, `REJECTED`
- **Response**: `200 OK`

### 6.6 Update Request Priority
- **Method**: `PUT`
- **Endpoint**: `/api/resource-requests/:id/priority`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Request Body**:
  ```json
  {
    "priority": "CRITICAL",
    "reason": "Flash flood warning issued for camp sector."
  }
  ```
- **Response**: `200 OK`

### 6.7 Get Request by ID
- **Method**: `GET`
- **Endpoint**: `/api/resource-requests/:id`
- **Authorization**: Any Authenticated User
- **Response**: `200 OK`

---

## 7. Duplicate Request Checks (`/api/duplicate-checks`)

### 7.1 Trigger Duplicate Detection
- **Method**: `POST`
- **Endpoint**: `/api/duplicate-checks/request/:id/detect`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Description**: Evaluates the request against active requests for the same camp to detect overlapping requisitions.
- **Response**: `200 OK`

### 7.2 Get Duplicate Checks for Request
- **Method**: `GET`
- **Endpoint**: `/api/duplicate-checks/request/:id`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Response**: `200 OK`

### 7.3 Review Duplicate Candidate
- **Method**: `PUT`
- **Endpoint**: `/api/duplicate-checks/:id/review`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Request Body**:
  ```json
  {
    "decision": "CONFIRMED_DUPLICATE",
    "reason": "Duplicate phone entry of online request #42."
  }
  ```
  *Permitted `decision` values*: `CONFIRMED_DUPLICATE`, `NOT_DUPLICATE`, `DISMISSED`
- **Response**: `200 OK`

---

## 8. Request Assignments (`/api/request-assignments`)

### 8.1 List Available Relief Teams
- **Method**: `GET`
- **Endpoint**: `/api/request-assignments/available-teams`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Response**: `200 OK` (Returns teams with status `AVAILABLE`)

### 8.2 Assign Team to Resource Request
- **Method**: `POST`
- **Endpoint**: `/api/request-assignments/request/:requestId/team/:teamId`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Request Body**:
  ```json
  {
    "notes": "Team Alpha dispatched with transport truck #4."
  }
  ```
- **Response**: `201 Created`

### 8.3 Get Assignments for Request
- **Method**: `GET`
- **Endpoint**: `/api/request-assignments/request/:requestId`
- **Authorization**: Any Authenticated User
- **Response**: `200 OK`

---

## 9. Relief Teams (`/api/teams`)

### 9.1 List All Relief Teams
- **Method**: `GET`
- **Endpoint**: `/api/teams`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`, `DMA_SUPERVISOR`
- **Response**: `200 OK`

### 9.2 Get Team by ID
- **Method**: `GET`
- **Endpoint**: `/api/teams/:id`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`, `DMA_SUPERVISOR`
- **Response**: `200 OK`

### 9.3 Create Relief Team
- **Method**: `POST`
- **Endpoint**: `/api/teams`
- **Authorization**: `DMA_SUPERVISOR`
- **Request Body**:
  ```json
  {
    "teamName": "Rapid Response Bravo",
    "contactNumber": "+1-800-555-0199",
    "memberUserIds": [5, 6]
  }
  ```
- **Response**: `201 Created`

### 9.4 Update Team Operational Status
- **Method**: `PUT`
- **Endpoint**: `/api/teams/:id/status`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`, `DMA_SUPERVISOR`, `RELIEF_TEAM`
- **Request Body**:
  ```json
  {
    "status": "BUSY"
  }
  ```
  *Permitted `status` values*: `AVAILABLE`, `BUSY`, `OFFLINE`
- **Response**: `200 OK`

---

## 10. Field Tasks (`/api/tasks`)

### 10.1 Dispatch Field Task
- **Method**: `POST`
- **Endpoint**: `/api/tasks`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Request Body**:
  ```json
  {
    "teamId": 1,
    "type": "RESOURCE_DELIVERY",
    "title": "Deliver drinking water pallets to North Camp",
    "description": "Deliver 500 bottles of 1L drinking water.",
    "locationAddress": "North Community Shelter, Gate 2",
    "latitude": 28.6200,
    "longitude": 77.2100,
    "resourceRequestId": 12
  }
  ```
  *Permitted `type` values*: `RESCUE`, `EVACUATION`, `MEDICAL_ASSISTANCE`, `RESOURCE_DELIVERY`
- **Response**: `201 Created`

### 10.2 List Team's Assigned Tasks
- **Method**: `GET`
- **Endpoint**: `/api/tasks/my-team`
- **Authorization**: `RELIEF_TEAM`
- **Response**: `200 OK`

### 10.3 Get Task by ID
- **Method**: `GET`
- **Endpoint**: `/api/tasks/:id`
- **Authorization**: Any Authenticated User
- **Response**: `200 OK`

### 10.4 Update Task Lifecycle Status
- **Method**: `PUT`
- **Endpoint**: `/api/tasks/:id/status`
- **Authorization**: `RELIEF_TEAM`
- **Request Body**:
  ```json
  {
    "status": "COMPLETED",
    "outcome": "Supplies successfully delivered and handed over to Camp Manager.",
    "latitude": 28.6201,
    "longitude": 77.2098,
    "clientEventId": "evt-uuid-12345"
  }
  ```
  *Permitted `status` values*: `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`, `CANCELLED`
- **Response**: `200 OK`

---

## 11. Deliveries (`/api/deliveries`)

### 11.1 Create Delivery Record
- **Method**: `POST`
- **Endpoint**: `/api/deliveries`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Request Body**:
  ```json
  {
    "requestId": 12,
    "campId": 1,
    "teamId": 1,
    "notes": "Dispatched with convoy vehicle #3",
    "items": [
      { "resourceId": 1, "quantity": 500 }
    ]
  }
  ```
- **Response**: `201 Created`

### 11.2 Get Deliveries for Request
- **Method**: `GET`
- **Endpoint**: `/api/deliveries/request/:requestId`
- **Authorization**: Any Authenticated User
- **Response**: `200 OK`

### 11.3 Get Delivery by ID
- **Method**: `GET`
- **Endpoint**: `/api/deliveries/:id`
- **Authorization**: Any Authenticated User
- **Response**: `200 OK`

### 11.4 Update Delivery Status
- **Method**: `PUT`
- **Endpoint**: `/api/deliveries/:id/status`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`, `RELIEF_TEAM`
- **Request Body**:
  ```json
  {
    "status": "DELIVERED",
    "notes": "Handover signed by relief camp supervisor."
  }
  ```
  *Permitted `status` values*: `PLANNED`, `IN_TRANSIT`, `DELIVERED`, `PARTIALLY_DELIVERED`, `FAILED`, `CANCELLED`
- **Response**: `200 OK`

---

## 12. Audit Logs (`/api/audit-logs`)

### 12.1 Query Audit Logs
- **Method**: `GET`
- **Endpoint**: `/api/audit-logs`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`, `DMA_SUPERVISOR`
- **Description**: Retrieves full chronological audit logs with before/after state snapshots and actor metadata.
- **Response**: `200 OK`

### 12.2 Create Manual Audit Entry
- **Method**: `POST`
- **Endpoint**: `/api/audit-logs`
- **Authorization**: `CONTROL_CENTRE_OPERATOR`
- **Request Body**:
  ```json
  {
    "action": "OVERRIDE",
    "entityType": "ResourceRequest",
    "entityId": 12,
    "description": "Manual override authorized by Incident Commander"
  }
  ```
- **Response**: `201 Created`

---

## 13. DMA Camp Management (`/api/dma/camps`)

### 13.1 Update Master Camp Information
- **Method**: `PUT`
- **Endpoint**: `/api/dma/camps/:id`
- **Authorization**: `DMA_SUPERVISOR`
- **Description**: Updates official master data (name, address, location coordinates, total capacity).
- **Request Body**:
  ```json
  {
    "name": "Central High School Relief Shelter (Expanded)",
    "address": "123 Main St, Sector 4, North Zone",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "capacity": 750
  }
  ```
- **Response**: `200 OK`

---

## 14. Camp Manager Operational Updates (`/api/camp-manager`)

### 14.1 Update Own Camp Operational Status
- **Method**: `PUT`
- **Endpoint**: `/api/camp-manager/me`
- **Authorization**: `RELIEF_CAMP_MANAGER`
- **Description**: Updates live operational occupancy, status, and on-ground notes for the manager's assigned camp.
- **Request Body**:
  ```json
  {
    "operationalStatus": "LIMITED",
    "currentOccupancy": 480,
    "operationalNotes": "Near capacity; intake restricted to vulnerable citizens."
  }
  ```
  *Permitted `operationalStatus` values*: `OPERATIONAL`, `LIMITED`, `FULL`, `TEMPORARILY_CLOSED`, `CLOSED`
- **Response**: `200 OK`
