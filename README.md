# CollabBoard — Real-Time Team Project Management Platform

> **Internship Final Project** — Codveda Technologies Software Development Internship (Level 3)  

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Why These Tasks Were Fused](#-why-these-tasks-were-fused)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Real-Time Events (Socket.io)](#-real-time-events-socketio)
- [Authentication & RBAC](#-authentication--rbac)
- [Database Schema](#-database-schema)
- [Design Decisions](#-design-decisions)
- [Deployment](#-deployment)
- [Screenshots](#-screenshots)
- [Author](#-author)

---

## 📌 Project Overview

**CollabBoard** is a real-time team project management platform where users can:

- Create and manage projects with role-based access control
- Organize work on a **live Kanban board** (Todo → In Progress → Review → Done)
- Communicate with teammates via **real-time project chat**
- Receive **instant notifications** when tasks are assigned or updated
- Work collaboratively with all changes reflected **instantly across all connected clients**

This project satisfies both Level 3 internship tasks within a single, production-realistic codebase — Task 1 provides the full-stack MERN foundation (auth, RBAC, database, deployment), and Task 2 provides the real-time layer (Socket.io rooms, bidirectional communication, user-specific notifications).

---

## 🔗 Why These Tasks Were Fused

| Level 3 Task 1 Requirements | How CollabBoard Covers It |
|---|---|
| Full-stack MERN application | React frontend + Node/Express backend + MongoDB |
| User authentication | JWT-based auth with bcrypt password hashing |
| Role-based access control | `admin` and `member` roles with route-level guards |
| Database interaction | Mongoose models with indexing and relationships |
| Frontend + backend deployed | Vercel (frontend) + Render (backend) |
| Performance optimization | DB indexing, Zustand state, lazy socket connections |

| Level 3 Task 2 Requirements | How CollabBoard Covers It |
|---|---|
| WebSockets via Socket.io | `socket.io` server + `socket.io-client` frontend |
| Real-time features | Live Kanban updates, team chat, notifications |
| Set up with Express | Socket.io attached to the same HTTP server as Express |
| Bidirectional communication | Client emits join/leave; server emits task and chat events |
| User-specific notifications | `user:<id>` personal rooms for targeted socket events |
| Optimize real-time updates | Room scoping — only project members receive broadcasts |

---

## ✨ Features

### 🔐 Authentication & Authorization
- Secure JWT-based registration and login
- Passwords hashed with bcrypt (12 salt rounds)
- Role-based access: **Admin** (full control) and **Member** (collaborative access)
- Protected REST routes via `auth.middleware.js`
- Protected Socket.io connections via socket middleware (same JWT)

### 📋 Project Management
- Create, view, and delete projects
- Invite members to projects by user ID
- Each project is fully isolated — members only see their own projects
- Project cards on the dashboard show member avatars and status

### ✅ Kanban Task Board
- Four columns: **To Do**, **In Progress**, **Review**, **Done**
- Create tasks with title, description, priority (low / medium / high), and initial status
- Move tasks between columns via a context menu
- Delete tasks with instant broadcast to all project members
- Priority badges with colour-coded indicators

### 💬 Real-Time Team Chat
- Per-project chat panel (toggle with Chat button)
- Messages persisted to MongoDB
- Paginated message history loaded on mount
- Live message delivery via Socket.io — no polling
- Own messages shown on the right, others on the left (WhatsApp-style)

### 🔔 Notification System
- Bell icon with unread count badge
- Notifications generated when tasks assigned to you are updated
- Delivered via personal `user:<id>` Socket.io rooms
- Mark-all-read on dropdown open

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and REST API |
| Socket.io | WebSocket server for real-time events |
| MongoDB + Mongoose | Database and ODM |
| JSON Web Tokens (JWT) | Stateless authentication |
| bcryptjs | Password hashing |
| dotenv | Environment variable management |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI component library |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| Zustand | Lightweight global state management |
| socket.io-client | WebSocket client |
| Axios | HTTP client with interceptors |
| Tailwind CSS | Utility-first styling |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT (React)                      │
│                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │  Zustand    │   │SocketContext │   │ Axios API   │  │
│  │   Store     │◄──│  (Socket.io) │   │  Layer      │  │
│  │ auth/project│   │              │   │             │  │
│  └──────┬──────┘   └──────┬───────┘   └──────┬──────┘  │
└─────────┼────────────────┼──────────────────┼──────────┘
          │                │ WebSocket         │ HTTP/REST
          │         ┌──────▼───────────────────▼──────┐
          │         │         NODE.JS SERVER           │
          │         │                                  │
          │         │  ┌─────────┐   ┌─────────────┐  │
          │         │  │ Express │   │  Socket.io  │  │
          │         │  │ Routes  │   │   Server    │  │
          │         │  └────┬────┘   └──────┬──────┘  │
          │         │       │               │          │
          │         │  ┌────▼───────────────▼──────┐  │
          │         │  │        Services            │  │
          │         │  │  (Business Logic + emit)  │  │
          │         │  └────────────┬───────────────┘  │
          │         │               │                  │
          │         │  ┌────────────▼───────────────┐  │
          │         │  │   MongoDB (via Mongoose)   │  │
          │         │  │  Users│Projects│Tasks│Msgs │  │
          │         │  └────────────────────────────┘  │
          │         └──────────────────────────────────┘
          │
          └── Socket events update Zustand store directly
              UI re-renders automatically for all clients
```

### Key Architectural Decisions

- **Services own all side-effects** — Socket.io `emit()` calls live inside service functions, not controllers. This keeps HTTP controllers thin and testable.
- **Socket events drive UI state** — After any mutation (create/update/delete task, new message), the server broadcasts via Socket.io. The Zustand store listens and updates. No manual re-fetching.
- **Single responsibility per file** — Every file has one job: routes define paths, controllers parse HTTP, services run logic, models define schema.
- **Room-scoped broadcasts** — `project:<id>` rooms ensure only members of a project receive that project's events. Personal `user:<id>` rooms handle targeted notifications.

---

## 📁 Project Structure

```
collabboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── socket.js          # Socket.io init, auth middleware, event rooms
│   │   ├── models/
│   │   │   ├── User.model.js      # User schema with bcrypt hooks
│   │   │   ├── Project.model.js   # Project schema with member relationships
│   │   │   ├── Task.model.js      # Task schema with status/priority enums
│   │   │   └── Message.model.js   # Chat message schema
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT verification, attaches req.user
│   │   │   ├── role.middleware.js  # RBAC guard (restrictTo)
│   │   │   └── error.middleware.js # Global error handler
│   │   ├── utils/
│   │   │   ├── jwt.util.js        # signToken, verifyToken
│   │   │   └── response.util.js   # Consistent JSON response helpers
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js  # Nests task and message routes
│   │   │   ├── task.routes.js     # mergeParams: true
│   │   │   └── message.routes.js  # mergeParams: true
│   │   ├── controllers/           # HTTP only — parse req, call service, send res
│   │   │   ├── auth.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── task.controller.js
│   │   │   └── message.controller.js
│   │   ├── services/              # Business logic + socket emissions
│   │   │   ├── auth.service.js
│   │   │   ├── project.service.js
│   │   │   ├── task.service.js    # Emits task:created/updated/deleted
│   │   │   └── message.service.js
│   │   ├── app.js                 # Express app setup, middleware, routes
│   │   └── server.js              # HTTP server, Socket.io init, DB connect
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js           # Axios instance with JWT interceptors
    │   │   ├── auth.api.js
    │   │   ├── project.api.js
    │   │   ├── task.api.js
    │   │   └── message.api.js
    │   ├── store/
    │   │   ├── authStore.js       # Zustand: user, token (persisted)
    │   │   └── projectStore.js    # Zustand: projects, tasks, messages, notifications
    │   ├── context/
    │   │   └── SocketContext.jsx  # Socket connection + event → store wiring
    │   ├── components/
    │   │   ├── TaskCard.jsx       # Kanban card with context menu
    │   │   ├── ChatPanel.jsx      # Real-time chat UI
    │   │   └── NotificationBell.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx  # Project grid
    │   │   └── ProjectPage.jsx    # Kanban board + chat
    │   ├── App.jsx                # Router + ProtectedRoute
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A MongoDB Atlas account (free tier is sufficient)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/collabboard.git
cd collabboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` (see [Environment Variables](#-environment-variables) section below).

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 8080
✅ MongoDB connected
```

### 3. Frontend Setup

Open a **second terminal**:

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### 4. Both Servers Must Run Simultaneously

| Terminal | Command | Port |
|---|---|---|
| Terminal 1 (Backend) | `cd backend && npm run dev` | 8080 |
| Terminal 2 (Frontend) | `cd frontend && npm run dev` | 5173 |

---

## 🔐 Environment Variables

### `backend/.env`

```env
# Server
PORT=8080
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/collabboard?retryWrites=true&w=majority

# JWT
JWT_SECRET=replace_with_a_long_random_string_minimum_32_chars
JWT_EXPIRES_IN=7d

# CORS
CLIENT_URL=http://localhost:5173
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:8080/api
VITE_SOCKET_URL=http://localhost:8080
```

> ⚠️ Never commit `.env` files to Git. Both are listed in `.gitignore`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and receive JWT |
| GET | `/api/auth/me` | ✅ | Get current user profile |

### Projects

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/projects` | ✅ | Any | Create a project |
| GET | `/api/projects` | ✅ | Any | Get my projects |
| GET | `/api/projects/:id` | ✅ | Member | Get project by ID |
| PATCH | `/api/projects/:id/members` | ✅ | Member | Add member |
| DELETE | `/api/projects/:id` | ✅ | Admin | Delete project |

### Tasks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects/:projectId/tasks` | ✅ | Get all project tasks |
| POST | `/api/projects/:projectId/tasks` | ✅ | Create task |
| PATCH | `/api/projects/:projectId/tasks/:id` | ✅ | Update task (status, etc.) |
| DELETE | `/api/projects/:projectId/tasks/:id` | ✅ | Delete task |

### Messages

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/projects/:projectId/messages` | ✅ | Get chat history (paginated) |
| POST | `/api/projects/:projectId/messages` | ✅ | Send a message |

#### Example Request — Register

```json
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "admin"
}
```

#### Example Response

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## ⚡ Real-Time Events (Socket.io)

### Connection

The client connects with the JWT in the handshake auth object:

```js
const socket = io('http://localhost:5000', {
  auth: { token: 'your_jwt_token' }
});
```

### Client → Server Events

| Event | Payload | Description |
|---|---|---|
| `join:project` | `projectId: string` | Join a project room to receive events |
| `leave:project` | `projectId: string` | Leave a project room |

### Server → Client Events

| Event | Payload | Description |
|---|---|---|
| `task:created` | `Task object` | New task created in the project |
| `task:updated` | `Task object` | Task status/fields updated |
| `task:deleted` | `{ taskId: string }` | Task was deleted |
| `message:new` | `Message object` | New chat message received |
| `notification` | `{ type, message, taskId, projectId }` | Personal notification |
| `user:joined` | `{ userId, name }` | Another user joined the project room |

### Room Strategy

```
project:<projectId>  →  All members of that project
user:<userId>        →  Personal notifications for that user
```

---

## 🔑 Authentication & RBAC

### Flow

```
Register/Login → JWT issued → Stored in Zustand (persisted)
                                      ↓
Every HTTP request → Authorization: Bearer <token> header (Axios interceptor)
Every Socket conn  → socket.handshake.auth.token (Socket middleware)
                                      ↓
Backend verifies JWT → attaches user to req.user / socket.user
                                      ↓
role.middleware.js checks req.user.role for restricted routes
```

### Roles

| Role | Can Do |
|---|---|
| `admin` | All member actions + delete projects |
| `member` | Create/join projects, manage tasks, chat |

---

## 🗄 Database Schema

### User
```
name        String  required
email       String  required, unique, indexed
password    String  hashed with bcrypt
role        Enum    ['admin', 'member']  default: member
avatar      String  optional
timestamps  createdAt, updatedAt
```

### Project
```
name        String  required
description String  optional
owner       ObjectId → User
members     [ObjectId] → User  (indexed)
status      Enum    ['active', 'archived']
timestamps  createdAt, updatedAt
```

### Task
```
title       String  required
description String  optional
project     ObjectId → Project  (indexed with status)
createdBy   ObjectId → User
assignedTo  ObjectId → User  (nullable)
status      Enum    ['todo', 'in-progress', 'review', 'done']
priority    Enum    ['low', 'medium', 'high']
dueDate     Date    optional
timestamps  createdAt, updatedAt
```

### Message
```
project     ObjectId → Project  (indexed with createdAt)
sender      ObjectId → User
content     String  max 2000 chars
timestamps  createdAt, updatedAt
```

---

## 💡 Design Decisions

### 1. Services Own Socket Emissions (SRP)
Socket `emit()` calls are placed inside service functions — not controllers. This means the controller's only job is to handle HTTP, and the service's job is to run business logic *and* all its side effects (DB write + socket broadcast) atomically.

### 2. Socket Events Drive All UI Mutations
After a task is created via REST, the server broadcasts `task:created` via Socket.io. The frontend Zustand store listens for this event and updates state. This means the UI is consistent for *all* connected users without any polling or manual re-fetching.

### 3. Nested REST Routes with `mergeParams`
Task and message routes are nested under projects (`/api/projects/:projectId/tasks`). Express's `mergeParams: true` on child routers exposes the parent `:projectId` param without URL repetition.

### 4. Single JWT Strategy for HTTP and WebSocket
The same `verifyToken` utility validates JWTs in both the HTTP `auth.middleware.js` and the Socket.io connection middleware. No separate session or cookie system needed.

### 5. Zustand Persist for Auth Only
Only the auth store (token + user) is persisted to `localStorage`. Project/task state is always fetched fresh on page load — this prevents stale UI data across sessions.

---

## 🌐 Deployment

### Backend — Render

1. Push backend folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node src/server.js`
5. Add all environment variables from `backend/.env`
6. Set `NODE_ENV=production` and `CLIENT_URL=https://your-frontend.vercel.app`

### Frontend — Vercel

1. Push frontend folder to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Framework preset: **Vite**
4. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
5. Deploy

### Post-Deployment

Update `backend/.env` (or Render env vars):
```env
CLIENT_URL=https://your-collabboard.vercel.app
```

Update MongoDB Atlas → Network Access → Add IP: `0.0.0.0/0` (allow all, for Render's dynamic IPs).

---

## 📸 Screenshots

| Page | Description |
|---|---|
| `/register` | Registration form with role selection |
| `/login` | Login form with error handling |
| `/dashboard` | Project grid with member avatars |
| `/project/:id` | Kanban board with live chat panel |

---

## 👨‍💻 Author

**Echanny**  
Software Developer Intern — Codveda Technologies (May–June 2026)  
---

## 📄 License

This project was built as an internship submission for Codveda Technologies.  
Licensed under the [MIT License](LICENSE).

---

*Built with the MERN stack + Socket.io — CollabBoard demonstrates full-stack development, real-time communication, JWT authentication, role-based access control, and production deployment practices.*
