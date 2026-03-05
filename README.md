# Assessment Platform

A simplified **Applicant Tracking System (ATS) with an Online Assessment Module** (MERN). The repo is split into **frontend** (React) and **backend** (Node.js + Express).

## Project structure

```
prayas/
├── frontend/     # React app (CRA) – UI, auth, candidates, assessment, admin
├── backend/      # Node.js + Express API – auth, DB placeholder, routes
└── README.md     # This file
```

## Quick start

### Backend

```bash
cd backend
npm install
# Copy env.example.txt to .env and set PORT, JWT_SECRET, optional MONGODB_URI
npm start
```

Runs at **http://localhost:5001** (health: `GET /api/health`).

### Frontend

```bash
cd frontend
npm install
npm start
```

Runs at **http://localhost:3000**. In development, the frontend proxies `/api` to the backend (port 5001).

## Overview

- **Candidates:** Register, login, submit application, dashboard (status), 30-min MCQ if shortlisted, confirmation.
- **Admin:** Register as admin, login, view/shortlist candidates, manage MCQ questions, view results, download CSV.

See **frontend/README.md** for full feature list and **backend/README.md** for API structure.

## Tech

| Layer   | Stack |
|--------|--------|
| Frontend | React, react-router-dom, mock store (localStorage) – ready to switch to API |
| Backend  | Node.js, Express, CORS, JWT (jsonwebtoken), optional Mongoose |
