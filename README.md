# Setter Capital Take-Home Assignment

**Name:** Ramyan Chelvanathan
**Email:** ramyanchelva@gmail.com

---

## Project Overview

Full-stack application for browsing, viewing, and editing fund data. Built with an Angular frontend and an Express/TypeScript backend.

## Stack

- **Frontend:** Angular 17+, TypeScript, SCSS
- **Backend:** Node.js, Express 5, TypeScript

## Setup & Running

### Backend
```
cd backend
npm install
npm run tsc       # terminal 1 — watch + compile
npm run start     # terminal 2 — start server
```
Server runs at `http://localhost:3000`

### Frontend
```
cd frontend
npm install
npx ng serve
```
App runs at `http://localhost:4300`

## Features Implemented

**Frontend**
- Admin Data Table — searchable, sortable, paginated fund list
- User Facing Detail View — full fund profile with managers and tags
- Admin Edit View — auto-saves on field blur, with delete confirmation

**Backend**
- `GET /api/funds` — fetch all funds
- `GET /api/funds/:index` — fetch single fund
- `PUT /api/funds/:index` — update fund (persists to JSON)
- `DELETE /api/funds/:index` — delete fund (persists to JSON)

## Notes

- Auto-save triggers on input blur — no save button needed
- Data is persisted directly to `backend/data/funds_data.json`
- Vintage year filter and column sorting are included
- Text search is included to search by Fund name
- `node_modules` folders have been removed before submission