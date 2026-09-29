# CEYPETCO Website Redesign

Full-stack rebuild of the official CEYPETCO website (https://ceypetco.gov.lk/).

## Tech Stack

**Frontend:**
React + Vite + Tailwind CSS

**Backend:**
Node.js + Express.js

**Database:**
MySQL

**Uploaded files:**
Stored locally under `backend/uploads/images` and `backend/uploads/docs`. Admin dashboard uploads and CRUD operations use local storage.

## Development Ports

Frontend: 5173
Backend: 5000

## Project Structure

```text
ceypetco-redesign/
│
├── frontend/   # React + Vite + Tailwind CSS
├── backend/    # Node.js + Express.js API
├── .gitignore
└── README.md
```

## Getting Started

### 1. Environment Variables

Copy the example env files and adjust if needed:

```bash
# Frontend
cp frontend/.env.example frontend/.env

# Backend
cp backend/.env.example backend/.env
```

- `frontend/.env` — set `VITE_API_BASE_URL` to the backend API base URL.
- `backend/.env` — set `PORT`, `CLIENT_URL`, and the `DB_*` connection variables.

### 2. Run the Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:5000.

Health check: http://localhost:5000/api/health

### 3. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173.

## Available Scripts

| Location | Command         | Description              |
| -------- | --------------- | ------------------------ |
| backend  | `npm run dev`   | Start backend with nodemon |
| backend  | `npm start`     | Start backend in production mode |
| frontend | `npm run dev`   | Start Vite dev server    |
| frontend | `npm run build` | Build for production     |
| frontend | `npm run preview` | Preview production build |

## Plesk deployment

See [PLESK_DEPLOYMENT.md](PLESK_DEPLOYMENT.md). The React frontend must be
built and served as static files; the backend is the Node.js application and
starts from `src/server.js`.

## Security Notes

Never commit:
- `.env` files
- SQL Server credentials
- Passwords, API secrets, or private keys
