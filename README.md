# Employee Shift Management System

## Authors
Kush Shah,
Stephen Wang

## Class Link
(https://johnguerra.co/classes/webDevelopment_online_fall_2025/)

## Project Objective
Deliver a scheduling workspace that supports CRUD operations for shift assignments and time-off requests with a React front end and Node + MongoDB API.

## Tech Stack
- React (hooks) with Vite tooling
- Node.js + Express API
- MongoDB Atlas or local Mongo instance
- Modern CSS modules for component styling

## Repository Structure
```
frontend/  # React client, hooks-based UI, styles
backend/   # Express API (shifts + time-off CRUD backed by MongoDB)
```

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9
- MongoDB instance (local Docker container or cloud cluster)

### Install Dependencies
```bash
npm install
cd backend && npm install && cd ..
```

Copy the backend environment template and set your MongoDB connection string:

```bash
cp backend/.env.example backend/.env
# edit backend/.env with your credentials
```

### Run in Development Mode
```bash
npm run dev      # start the Vite dev server
cd backend && npm run dev
```

The Vite dev server runs on `http://localhost:5173` and the API listens on `http://localhost:4000` by default.

Create `frontend/.env` if you want to override the default API base URL:

```
VITE_API_BASE_URL=http://localhost:4000
```

### Build for Production
```bash
npm run build
```

## License
Distributed under the MIT License. See `LICENSE` for details.
