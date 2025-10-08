# Sandeep Agri Store - MERN Monorepo

Modern MERN stack app to manage inventory, customers, sales, and credit ledger for an agriculture shop.

## Tech
- Backend: Node.js, Express, TypeScript, Mongoose, Zod, JWT
- Frontend: React (Vite + TS), MUI, React Router, React Query
- DB: MongoDB

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)

### Setup

1. Copy env sample and fill values:
   - Backend: `backend/.env.example` -> `backend/.env`
2. Install deps:
   - Backend: `cd backend && npm install`
   - Frontend: `cd ../frontend && npm install`
3. Run dev:
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

## Structure
```
backend/
  src/
frontend/
  src/
```

## Scripts
- Backend: build, dev (ts-node-dev), start
- Frontend: dev, build, preview

## Notes
- Use separate MongoDB databases for dev and prod.
- Default admin user can be seeded on first run if `SEED_ADMIN=true`.
