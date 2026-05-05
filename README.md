# ProjectTracker

A full-stack project and task management application with role-based access control, built with Next.js, NextAuth, Prisma, and SQLite.

## Features
- **Authentication**: Secure Signup and Login using credentials.
- **Role-Based Access**:
  - `ADMIN`: Can create projects, create tasks, assign tasks to any member, delete projects/tasks, and update any task's status.
  - `MEMBER`: Can view projects, view tasks, and update the status of tasks assigned specifically to them.
- **Dashboard**: Overview of projects and tasks, highlighting task counts and statuses. Overdue tasks are flagged.
- **Task Management**: Create tasks within projects, assign to users, set due dates, and track statuses (TODO, IN_PROGRESS, DONE).
- **Beautiful UI**: Modern, clean design with gradients, glassmorphism, and responsive layouts.

## Tech Stack
- Frontend & Backend: Next.js (App Router)
- Database: SQLite (via Prisma ORM)
- Authentication: NextAuth (Credentials provider + bcryptjs)
- Styling: Custom vanilla CSS properties

## Local Development
1. Clone the repository and navigate into it.
2. Install dependencies: `npm install`
3. Push the database schema: `npx prisma db push`
4. Start the dev server: `npm run dev`

## Railway Deployment (Mandatory)

This app is ready to be deployed to Railway out-of-the-box! Follow these simple steps:

1. **Push to GitHub**: Push this repository to your GitHub account.
2. **Create Railway Project**: Go to [Railway.app](https://railway.app/), click "New Project" -> "Deploy from GitHub repo", and select this repository.
3. **Environment Variables**: After the initial deployment, go to the project's **Variables** tab in Railway and add:
   - `NEXTAUTH_URL`: The public domain provided by Railway (e.g., `https://your-app.up.railway.app`).
   - `NEXTAUTH_SECRET`: A random string (you can generate one or just enter any strong random string).
4. **Trigger Redeploy**: Changing variables will automatically trigger a redeploy.
5. **Live & Functional**: The app uses SQLite, which means the database is stored in a file (`dev.db`). 
   - *Note*: Railway's ephemeral file system resets on every deploy. If you want persistent data across updates, attach a **Volume** in Railway and mount it to `/app/` where `dev.db` resides.

🚀 Enjoy tracking your projects!
