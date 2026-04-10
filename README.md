# 💸 ExpenseOS — Containerized Expense Tracker

> A full-stack DevOps project: **Node.js + SQLite backend**, **nginx-served frontend**, fully **Dockerized**, with **GitHub Actions CI/CD**.

![CI Badge](https://github.com/YOUR_USERNAME/expense-tracker/actions/workflows/ci.yml/badge.svg)

---

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── server.js           ← Express REST API
│   ├── package.json
│   ├── Dockerfile          ← Multi-stage, non-root image
│   ├── .dockerignore
│   └── tests/
│       └── api.test.js     ← Jest + Supertest
│
├── frontend/
│   ├── index.html          ← Single-file SPA (vanilla JS)
│   ├── nginx.conf          ← Nginx reverse-proxy config
│   └── Dockerfile
│
├── .github/
│   └── workflows/
│       └── ci.yml          ← GitHub Actions: test → build → push
│
├── docker-compose.yml      ← Full stack orchestration
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Option 1 — Docker Compose (recommended)

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker

# Build & run everything
docker compose up --build

# App is live at:
#   Frontend → http://localhost
#   Backend  → http://localhost:5000
```

### Option 2 — Run backend locally

```bash
cd backend
npm install
npm start          # or: npm run dev  (nodemon)
# API → http://localhost:5000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/expenses` | List all expenses (supports `?category=Food&from=2024-01-01&to=2024-12-31&sort=amount&order=ASC`) |
| GET | `/api/expenses/summary` | Totals, by-category, monthly breakdown |
| GET | `/api/expenses/:id` | Single expense |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### POST /api/expenses body

```json
{
  "title": "Grocery run",
  "amount": 850.50,
  "category": "Food",
  "date": "2024-03-15",
  "note": "Big Bazaar weekly shop"
}
```

---

## 🧪 Running Tests

```bash
cd backend
npm install
npm test
```

Tests cover: health check, CRUD operations, validation errors, 404 handling.

---

## 🐳 Docker Details

### Backend image
- Base: `node:20-alpine` (multi-stage)
- Non-root user (`appuser`)
- `dumb-init` for proper signal handling
- SQLite data persisted via Docker named volume

### Frontend image
- Base: `nginx:1.25-alpine`
- Serves static HTML
- Reverse-proxies `/api/*` → backend container

### Useful Docker commands

```bash
# View running containers
docker compose ps

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down

# Stop + remove volumes (clears DB!)
docker compose down -v

# Rebuild after code changes
docker compose up --build
```

---

## ⚙️ GitHub Actions CI/CD

### Pipeline stages

```
Push to main/dev
       │
       ▼
  🧪 Test job
  (npm test)
       │
       ▼
  🐳 Build & Push
  (GHCR images)
       │
       ▼
  🔍 Lint & Audit
  (Hadolint + npm audit)
```

### Setup GitHub Actions

1. Push code to GitHub
2. Actions run automatically on push to `main` or `dev`
3. Docker images are pushed to **GitHub Container Registry (GHCR)**
4. No secrets needed — uses `GITHUB_TOKEN` automatically

---

## 🗂️ Git Branching Strategy

```
main  ← production-ready, protected
  │
  └── dev ← integration branch
        │
        └── feature/add-expense
        └── fix/summary-bug
```

```bash
# Start new feature
git checkout dev
git checkout -b feature/my-feature

# Merge via PR: feature → dev → main
```

---

## 🏗️ DevOps Concepts Demonstrated

| Concept | Tool | Where |
|---------|------|--------|
| Version Control | Git + GitHub | All source code |
| Branching | Git | `main` / `dev` / `feature/*` |
| CI Pipeline | GitHub Actions | `.github/workflows/ci.yml` |
| Unit Tests | Jest + Supertest | `backend/tests/` |
| Containerization | Docker | `backend/Dockerfile`, `frontend/Dockerfile` |
| Multi-service orchestration | Docker Compose | `docker-compose.yml` |
| Reverse proxy | nginx | `frontend/nginx.conf` |
| Image registry | GHCR | CI push step |
| Security | Non-root user, npm audit, Hadolint | Dockerfiles + CI |
| Data persistence | Docker volumes | `docker-compose.yml` |

---

## 📦 Tech Stack

- **Backend**: Node.js 20 + Express 4 + better-sqlite3
- **Frontend**: Vanilla HTML/CSS/JS (single file, zero dependencies)
- **Database**: SQLite (file-based, zero config)
- **Reverse Proxy**: nginx
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry (GHCR)

---

## 👤 Author

Built as a DevOps learning project. Fork it, extend it, break it, fix it. 🚀
