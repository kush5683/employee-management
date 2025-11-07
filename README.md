# Employee Shift Management System

## Authors
Kush Shah,  
Stephen Wang

## Class Link
[CS 5610 / Web Development Online – Fall 2025](https://johnguerra.co/classes/webDevelopment_online_fall_2025/)

## Project Objective
Deliver a full-stack scheduling workspace where managers can administer employees, publish shifts, approve/deny time-off, and coordinate weekly availability windows while individual contributors get a personalized dashboard.

## Live Demo
- **App:** [https://project2.kushshah.net](https://project2.kushshah.net)
- **API health:** [https://project2.kushshah.net/api/health](https://project2.kushshah.net/api/health)

## Screenshot
![Application screenshot showing the employee dashboard](https://dummyimage.com/1200x650/0f172a/f8fafc&text=Employee+Management+Dashboard)

## Features
- Secure login backed by JWT + role-aware permissions (manager vs employee).
- Employee CRUD with inline adds/deletes, shift assignment, PTO approvals, and availability editing.
- Data-driven UI built from four Mongo collections (`employees`, `shifts`, `time_off_requests`, `availabilities`) containing 1,000 seeded employees and thousands of related records.
- Responsive layout with component-scoped CSS modules and accessible, standards-based markup (no div-based buttons).
- Dockerized deployment (Mongo, Express API, Vite-built frontend) fronted by Cloudflare for TLS.

## Usage
1. Browse to the live demo (or your local build) and use one of the demo accounts shown on the login page.  
   - Example: `jordan.miles@example.com / jorda-44fcf1` (manager)  
   - All auto-generated accounts use `changeme123`.
2. Managers land on the People view where they can:
   - Add/remove employees.
   - Create, edit, or delete shifts.
   - Approve, reject, or cancel time off.
3. Employees are redirected to their Availability page to self-manage scheduling preferences and PTO.

## Tech Stack
- React 18 + Vite + React Router (hooks-based components, >3 components each in its own file).
- Node.js + Express backend with modular controllers, middleware, and Mongo driver.
- MongoDB with seeded synthetic data (>=1k records).
- ESLint + Prettier enforced via `npm run lint` and repo-level `.prettierrc`.

## Repository Structure
```
frontend/      # React client, component-scoped CSS, eslint config
backend/       # Express app, routes, controllers, Mongo helpers
docker/        # Environment-specific Dockerfiles + init scripts
scripts/       # Utility scripts (data export, rebuild helpers)
```

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- Docker Desktop (for the production-like stack)

### Install Dependencies
```bash
npm install                   # frontend workspace (root package.json)
cd backend && npm install && cd ..
```

Copy the backend environment template and set your MongoDB connection string:
```bash
cp backend/.env.example backend/.env
# edit backend/.env with your credentials (never commit real secrets)
```

### Run in Development Mode
```bash
npm run dev                   # Vite dev server on http://localhost:5173
cd backend && npm run dev     # Express API on http://localhost:4000
```

Override the frontend API base URL via `frontend/.env` if needed:
```
VITE_API_BASE_URL=http://localhost:4000
```

### Linting & Formatting
```bash
npm run lint                  # ESLint (airbnb + hooks + a11y + prettier)
npx prettier --check .        # ensure Prettier formatting
```

### Docker Deployment / Rebuild
```bash
./rebuild.sh                  # stops containers, rebuilds images, seeds Mongo (1k+ records)
```
> `mongo-data` is recreated only when you run `docker compose down -v`, which re-triggers `docker/mongo-init/seed.js` to load the synthetic dataset.

## Data & API
- **Collections:** `employees`, `shifts`, `time_off_requests`, `availabilities`.
- **CRUD Coverage:** Every collection supports create, read, update, delete through authenticated routes. Each teammate implemented full CRUD on at least one module.
- **Seed Volume:** `docker/mongo-init/seed.js` inserts 1,000 employees plus thousands of related shift, PTO, and availability documents.
- **Node + Express:** The backend is a classic Express server (`backend/src/server.js`) exposing REST routes, JWT auth, and middleware-driven validation.

## Deployment
- Source builds via Vite → served by Nginx (TLS terminated by Cloudflare) on `project2.kushshah.net`.
- Docker Compose orchestrates Mongo, API, and frontend images; TLS certs mount into the frontend container.

## License
Distributed under the MIT License. See `LICENSE` for details.
