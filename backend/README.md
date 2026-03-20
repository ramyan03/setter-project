# Backend

## Setup
```
npm install
```
Ensure `backend/data/funds_data.json` exists before starting.

## Start
Run in two separate terminals:
```
npm run tsc
npm run start
```
Server runs at `http://localhost:3000`

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/funds` | Get all funds |
| GET | `/api/funds/:index` | Get single fund |
| PUT | `/api/funds/:index` | Update fund |
| DELETE | `/api/funds/:index` | Delete fund |

## Notes
- Data is persisted to `funds_data.json` on every write
- CORS enabled for local frontend development