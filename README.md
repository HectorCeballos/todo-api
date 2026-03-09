# todo-api

A RESTful task management API built with Node.js and Express, featuring JWT authentication, input validation, and a persistent SQLite database.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Request & Response Format](#request--response-format)
- [Authentication](#authentication)
- [Validation](#validation)
- [Database](#database)
- [Getting Started](#getting-started)

---

## Overview

This API allows users to register, log in, and manage their own tasks. Every request to a task endpoint must include a valid JWT token obtained from the login or register endpoint. All data is stored in a local SQLite database file (`data.db`) that persists between server restarts.

**Tech stack:**
- Node.js — runtime
- Express — web framework
- better-sqlite3 — SQLite database driver
- bcryptjs — password hashing
- jsonwebtoken — JWT creation and verification
- zod — request body validation
- dotenv — environment variable management
- nodemon — auto-restart during development

---

## Project Structure

```
todo-api/
├── src/
│   ├── routes/
│   │   ├── auth.js          # Auth route definitions (/auth/register, /auth/login)
│   │   └── tasks.js         # Task route definitions (/tasks, /tasks/:id)
│   ├── controllers/
│   │   ├── auth.js          # Register and login business logic
│   │   └── tasks.js         # CRUD logic for tasks
│   ├── middleware/
│   │   ├── authenticate.js  # JWT verification middleware
│   │   └── errorHandler.js  # Central error handler
│   ├── validators/
│   │   ├── auth.js          # Zod schemas for register and login
│   │   └── tasks.js         # Zod schemas for creating and updating tasks
│   └── db/
│       ├── database.js      # SQLite connection and table initialization
│       └── seed.js          # Seed script for sample data
├── server.js                # Entry point — starts the server
├── .env                     # Environment variables (not committed to git)
└── .gitignore
```

### Why this structure?

The project separates **routes** (what URL maps to what) from **controllers** (what actually happens). This keeps files small and focused. When the project grows, you know exactly where to look for each piece of logic.

---

## How It Works

### Request Lifecycle

Every request follows this path:

```
Client Request
    │
    ▼
server.js         — starts the server on PORT from .env
    │
    ▼
src/app.js        — runs middleware (CORS, JSON parsing)
    │
    ▼
routes/           — matches the URL and HTTP method
    │
    ▼
middleware/       — runs authenticate.js if route is protected
    │
    ▼
controllers/      — executes business logic, queries the database
    │
    ▼
Response sent back to client
```

### Middleware

Middleware are functions that run between the request arriving and the controller handling it. This API uses three:

- **`cors()`** — allows the frontend (running on a different port) to talk to the API. Without this, browsers block the requests.
- **`express.json()`** — parses the JSON body of incoming requests and makes it available as `req.body`.
- **`authenticate`** — verifies the JWT token on every protected route. If the token is missing or invalid, the request is rejected with a `401` before it ever reaches the controller.

---

## API Endpoints

### Auth (Public — no token required)

| Method | URL | Description |
|--------|-----|-------------|
| POST | `/auth/register` | Create a new user account |
| POST | `/auth/login` | Log in and receive a JWT token |

### Tasks (Protected — token required)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get a single task by ID |
| POST | `/tasks` | Create a new task |
| PATCH | `/tasks/:id` | Partially update a task |
| DELETE | `/tasks/:id` | Delete a task |

---

## Request & Response Format

Every response from this API follows the same consistent shape:

**Success:**
```json
{
  "data": { ... },
  "error": null
}
```

**Failure:**
```json
{
  "data": null,
  "error": "Description of what went wrong"
}
```

This consistency means the client always knows where to look — check `error` first, then use `data`.

### HTTP Status Codes Used

| Code | Meaning | When it's returned |
|------|---------|-------------------|
| 200 | OK | Successful GET or PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Unhandled server error |

---

## Authentication

This API uses **JWT (JSON Web Tokens)** for authentication.

### How it works

1. The client sends a `POST /auth/register` or `POST /auth/login` request with credentials.
2. The server verifies the credentials and returns a signed JWT token that expires in 7 days.
3. The client stores this token and sends it with every subsequent request in the `Authorization` header:

```
Authorization: Bearer <token>
```

4. The `authenticate` middleware on every task route verifies this token before allowing the request through.

### Why tokens instead of passwords on every request?

Sending your password on every request is a security risk — more chances for it to be intercepted. A token is short-lived, contains no sensitive data, and can be revoked or expired without changing the user's password.

### Password hashing

Passwords are never stored in plain text. Before saving, every password is run through **bcrypt** with a salt round of 10, turning it into an irreversible hash. When logging in, bcrypt compares the incoming password against the stored hash without ever decoding it.

---

## Validation

All incoming request bodies are validated using **Zod** before any business logic runs.

### Task validation rules

**Creating a task (`POST /tasks`):**
- `title` — required, must be a non-empty string
- `description` — optional string

**Updating a task (`PATCH /tasks/:id`):**
- `title` — optional, but if provided must be a non-empty string
- `description` — optional string
- `completed` — optional boolean

### Auth validation rules

**Register (`POST /auth/register`):**
- `username` — required, minimum 3 characters
- `email` — required, must be a valid email format
- `password` — required, minimum 6 characters

**Login (`POST /auth/login`):**
- `email` — required, must be a valid email format
- `password` — required, must not be empty

If validation fails, the API returns a `400 Bad Request` immediately with a detailed error object showing exactly which field failed and why. The database is never touched.

---

## Database

The database is a single SQLite file (`data.db`) stored in the project root. It is created automatically when the server starts for the first time.

### Tables

**users**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto-incremented |
| username | TEXT | Unique |
| email | TEXT | Unique |
| password | TEXT | Bcrypt hash, never plain text |
| createdAt | TEXT | Set automatically by SQLite |

**tasks**
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | Primary key, auto-incremented |
| title | TEXT | Required |
| description | TEXT | Defaults to empty string |
| completed | INTEGER | 0 = false, 1 = true (SQLite has no boolean type) |
| createdAt | TEXT | Set automatically by SQLite |

### Why SQLite?

SQLite requires no separate database server to install or run. The entire database lives in one file. It uses the same SQL syntax as PostgreSQL and MySQL, so the knowledge transfers directly when scaling up to a server-based database.

### Seed data

To populate the database with sample tasks for testing:

```bash
npm run seed
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/HectorCeballos/todo-api.git
cd todo-api

# Install dependencies
npm install

# Create environment file
echo "PORT=3000" > .env
echo "JWT_SECRET=your_secret_key_here" >> .env

# Seed the database (optional)
npm run seed

# Start the development server
npm run dev
```

The server will start on `http://localhost:3000`.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with auto-restart (development) |
| `npm start` | Start server without auto-restart (production) |
| `npm run seed` | Populate database with sample tasks |