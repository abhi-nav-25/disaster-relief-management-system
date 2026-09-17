# Contributing to Disaster Relief Management System (DRMS)

Thank you for your interest in contributing to the **Disaster Relief Management System (DRMS)** (CrisisRelief / Disaster Response Grid)! This project is an open-source disaster response platform built with React, Express, TypeScript, and Prisma.

Please review these guidelines to ensure a smooth, collaborative contribution workflow.

---

## 1. Code of Conduct & Core Principles

- **Separation of Concerns**: Keep backend business logic, database queries, and frontend UI strictly separated in their designated architectural layers.
- **Security First**: **NEVER** commit real `.env` files, passwords, database connection strings, JWT secrets, or production API keys. Always use `.env.example` as a template with placeholder values.
- **Type Safety**: Maintain comprehensive TypeScript typing across both frontend and backend modules. Avoid `any` where structured interfaces can be defined.

---

## 2. Getting Started (Development Setup)

### Prerequisites
- **Node.js**: v18.0.0 or later (LTS recommended)
- **npm**: v9.0.0 or later
- **PostgreSQL**: v14.0 or later

### Step-by-Step Local Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/nandaniy487-star/disaster-relief-management-system.git
   cd disaster-relief-management-system
   ```

2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/issue-description
   ```

3. **Configure & Install Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   *Edit `backend/.env` with your local PostgreSQL database URL and development JWT secret.*

   Apply Prisma database migrations:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Configure & Install Frontend**:
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```
   *Ensure `VITE_API_URL` points to `http://localhost:5000/api`.*

---

## 3. Running the Application Locally

In two separate terminal windows:

- **Terminal 1: Start Backend API (Port 5000)**:
  ```bash
  cd backend
  npm run dev
  ```

- **Terminal 2: Start Frontend Web Client (Port 5173)**:
  ```bash
  cd frontend
  npm run dev
  ```

Access the application in your browser at `http://localhost:5173`.

---

## 4. Pre-Commit Quality Checks

Before committing changes or opening a Pull Request, verify that both the frontend and backend compile and build with zero errors:

```bash
# Verify Backend TypeScript Compilation
cd backend
npm run build

# Verify Frontend TypeScript & Vite Build
cd ../frontend
npm run build
```

---

## 5. Pull Request Guidelines

1. Ensure your branch is up to date with `main`.
2. Commit with descriptive, conventional commit messages (e.g., `feat: add phone channel support to on-behalf request controller`, `fix: correct distance calculation in nearest camps page`).
3. Run `git status` to verify:
   - No `.env` or credential files are staged.
   - No `node_modules/` or build artifacts (`dist/`) are tracked.
4. Open a Pull Request on GitHub with a clear explanation of:
   - What problem the change solves.
   - Which endpoints or UI components were modified.
   - Steps to test the changes locally.
