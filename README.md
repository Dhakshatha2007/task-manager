# TaskFlow — Task Management App
## Live Demo 🔗- https://task-manager-olive-nine-36.vercel.app/

A full-stack task management app with user accounts, task CRUD, and live updates.

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React (Vite) + Tailwind CSS + React Router + Axios + Socket.IO client |
| Backend   | Node.js + Express |
| Database  | PostgreSQL (via Prisma ORM) |
| Auth      | JWT (JSON Web Tokens) + bcrypt password hashing |
| Real-time | Socket.IO (task list updates instantly across open tabs/devices) |

## Features

- Register / log in with a hashed password and a JWT session
- Full task CRUD: create, list, filter (To Do / In Progress / Done), edit, delete
- Priority (Low/Medium/High) and optional due dates
- Live updates: if you open the app in two tabs (or on two devices) and change a task in one, the other updates instantly without a refresh
- Responsive layout — usable on phone, tablet, and desktop
- Each user only ever sees and edits their own tasks (enforced on the backend, not just hidden in the UI)

## Project structure

```
task-manager/
├── backend/               Express API
│   ├── prisma/schema.prisma   Database schema (User, Task)
│   ├── src/
│   │   ├── controllers/       Request handlers (auth, tasks)
│   │   ├── middleware/auth.js JWT verification middleware
│   │   ├── routes/            Express routers
│   │   ├── utils/prisma.js    Shared Prisma client
│   │   └── index.js           App entry point + Socket.IO setup
│   ├── .env.example
│   └── package.json
└── frontend/              React app
    ├── src/
    │   ├── api/axios.js        Axios instance with auth header + 401 handling
    │   ├── context/AuthContext.jsx  Login state + Socket.IO connection
    │   ├── components/         Navbar, TaskCard, TaskForm, ProtectedRoute
    │   └── pages/               Login, Register, Dashboard
    ├── .env.example
    └── package.json
```

## 1. Set up the database (free, ~2 minutes)

You need a PostgreSQL connection string. The easiest free option:

1. Go to [neon.tech](https://neon.tech) and sign up (free tier, no credit card).
2. Create a new project. Copy the **connection string** it gives you (starts with `postgresql://`).
3. That's your `DATABASE_URL`.

(Alternatively, if you have PostgreSQL installed locally, you can use a local connection string instead.)

## 2. Run the backend locally

```bash
cd backend
cp .env.example .env
# Edit .env: paste your DATABASE_URL, and set a random JWT_SECRET

npm install
npx prisma migrate dev --name init   # creates the User/Task tables
npm run dev                          # starts the API on http://localhost:5000
```

Check it worked: open `http://localhost:5000/api/health` — you should see `{"status":"ok"}`.

## 3. Run the frontend locally

In a second terminal:

```bash
cd frontend
cp .env.example .env   # defaults already point at localhost:5000, fine for local dev

npm install
npm run dev             # starts the app on http://localhost:5173
```

Open `http://localhost:5173`, register an account, and start adding tasks. Open a second browser tab and watch tasks update live in both when you edit one.

## 4. Deploying for free

**Database:** you already have it — Neon, used above.

**Backend → Render:**
1. Push this project to a GitHub repo.
2. On [render.com](https://render.com), create a new **Web Service**, point it at your repo, root directory `backend`.
3. Build command: `npm install && npx prisma generate`
4. Start command: `npx prisma migrate deploy && npm start`
5. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_ORIGIN` (set this to your Vercel URL once you have it, e.g. `https://your-app.vercel.app`).

**Frontend → Vercel:**
1. On [vercel.com](https://vercel.com), import the same repo, root directory `frontend`.
2. Framework preset: Vite.
3. Add environment variables: `VITE_API_URL` = `https://your-backend.onrender.com/api`, `VITE_SOCKET_URL` = `https://your-backend.onrender.com`.
4. Deploy. Once it's live, go back to Render and update `CLIENT_ORIGIN` to this Vercel URL, then redeploy the backend.

That's it — your app is now live and accessible from a public URL.

## API reference (quick)

| Method | Route              | Auth? | Description |
|--------|---------------------|-------|--------------|
| POST   | /api/auth/register  | No    | Create an account, returns a token |
| POST   | /api/auth/login     | No    | Log in, returns a token |
| GET    | /api/auth/me        | Yes   | Current user's profile |
| GET    | /api/tasks          | Yes   | List your tasks (`?status=`, `?priority=` optional filters) |
| POST   | /api/tasks          | Yes   | Create a task |
| PUT    | /api/tasks/:id      | Yes   | Update a task |
| DELETE | /api/tasks/:id      | Yes   | Delete a task |

Authenticated requests need `Authorization: Bearer <token>`.

## Future Improvements

- Task comments or activity log
- Assign tasks to other users / shared team boards
- Email reminders for approaching due dates
- Drag-and-drop between status columns (Kanban view)
- Unit/integration tests (Jest + Supertest for the API)
