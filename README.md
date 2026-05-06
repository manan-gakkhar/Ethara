# ProjectTracker

A full-stack project and task management application with role-based access control, built with Next.js, NextAuth, Mongoose, and MongoDB.

---

## Purpose

ProjectTracker is a collaborative tool for teams to organize work across projects and tasks. It supports two roles — **Admin** and **Member** — with different levels of access:

- **Admins** can create and delete projects, create and delete tasks, and assign tasks to team members.
- **Members** can view all projects and tasks, and update the status of tasks assigned to them.

The goal is to give teams a clean, minimal interface to track what needs to be done, who is doing it, and where things stand — without the overhead of complex project management tools.

---

## Features

- **Authentication** — Email/password signup and login, plus Google OAuth sign-in
- **Role-based access** — Admin and Member roles enforced on both the UI and API
- **Projects** — Admins can create and delete projects; all users can view them
- **Tasks** — Admins create tasks with a title, description, assignee, and due date
- **Kanban board** — Tasks are displayed in three columns: To Do, In Progress, Done
- **Status updates** — Assignees and admins can move tasks between statuses
- **Overdue indicators** — Tasks past their due date are flagged automatically
- **Persistent sessions** — JWT-based sessions stored securely via NextAuth

---

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project with the following:

```env
MONGODB_URI="your-mongodb-connection-string"

NEXTAUTH_SECRET="a-random-secret-string"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**MongoDB URI format (Railway example):**
```
mongodb://user:password@host:port/database?authSource=admin
```

**Google OAuth setup:**
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Navigate to APIs & Services → Credentials → Create OAuth 2.0 Client ID
3. Add `http://localhost:3000/api/auth/callback/google` to Authorized Redirect URIs
4. Copy the Client ID and Client Secret into your `.env`

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create your first Admin account

Go to `/signup`, fill in your details, and select **Admin** as the role. This account will have full access to create projects and tasks.

---

## Tech Stack

### Framework

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.2.4 | Full-stack React framework (App Router) |
| `react` | 19.2.4 | UI library |
| `react-dom` | 19.2.4 | React DOM renderer |
| `typescript` | ^5 | Static typing |

### Authentication

| Package | Version | Purpose |
|---|---|---|
| `next-auth` | ^4.24.14 | Authentication (credentials + Google OAuth) |
| `@auth/mongodb-adapter` | ^3.7.4 | NextAuth adapter for MongoDB (sessions, accounts) |
| `bcryptjs` | ^3.0.3 | Password hashing |

### Database

| Package | Version | Purpose |
|---|---|---|
| `mongodb` | ^6.16.0 | Native MongoDB driver (used by NextAuth adapter) |
| `mongoose` | ^8.15.0 | ODM for defining models and querying MongoDB |

### UI

| Package | Version | Purpose |
|---|---|---|
| `lucide-react` | ^1.14.0 | Icon library |
| `framer-motion` | ^12.38.0 | Animations |

### Dev Dependencies

| Package | Purpose |
|---|---|
| `eslint` + `eslint-config-next` | Linting |
| `@types/node`, `@types/react`, `@types/react-dom`, `@types/bcryptjs` | TypeScript type definitions |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/   # NextAuth handler
│   │   │   └── signup/          # Custom signup endpoint
│   │   ├── projects/            # GET all, POST create, GET/DELETE by id
│   │   ├── tasks/               # POST create, PATCH/DELETE by id
│   │   └── users/               # GET all users (for task assignment)
│   ├── dashboard/
│   │   ├── layout.tsx           # Nav bar + auth guard
│   │   ├── page.tsx             # Projects list
│   │   └── projects/[id]/       # Project detail + kanban board
│   ├── login/                   # Login page
│   ├── signup/                  # Signup page
│   └── providers.tsx            # SessionProvider wrapper
├── lib/
│   ├── auth.ts                  # NextAuth config
│   ├── mongodb.ts               # MongoClient singleton (for adapter)
│   └── mongoose.ts              # Mongoose connection singleton
└── models/
    ├── User.ts                  # User schema
    ├── Project.ts               # Project schema
    └── Task.ts                  # Task schema
```
